# GitHub repository ruleset helpers.
# Real work lives in scripts/; this Makefile is a thin wrapper.
# Target/variable names are prefixed with ruleset- / RULESET_ so this
# file can be vendored via git subtree without colliding with host Makefiles.
#
# npm workspace lives in dev/. Root `make` targets wrap `npm run *` there.
# Target names replace `:` in script names with `-` (e.g. build:style → build-style).

SHELL := /bin/bash

RULESET_ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
RULESET_SCRIPTS := $(RULESET_ROOT_DIR)/scripts
DEV_DIR := $(RULESET_ROOT_DIR)/dev

# Only take over the default goal when this file is the primary Makefile.
ifeq ($(abspath $(firstword $(MAKEFILE_LIST))),$(RULESET_ROOT_DIR)/Makefile)
.DEFAULT_GOAL := help
endif

# Explicit override wins. Otherwise apply/check resolve via `gh repo view`
# (canonical nameWithOwner — avoids HTTP 307 on renamed remotes).
RULESET_REPO ?=
RULESET_BRANCH ?= main
RULESET_VISIBILITY ?= public
RULESET_CREATE_FLAGS ?=

RULESET_CURRENT_REPO = $(shell gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

.PHONY: help \
	dev-kitchen-sink preview-kitchen-sink dev-storybook \
	build-style build-components build-the-wheels build-kitchen-sink build-storybook \
	test-components test-package test-e2e \
	ruleset-help ruleset-create ruleset-apply ruleset-check

help:
	@printf '%s\n' \
		'npm (run from repo root; equivalent to cd dev && npm run <script>):' \
		'' \
		'  make dev-kitchen-sink' \
		'  make preview-kitchen-sink' \
		'  make dev-storybook' \
		'  make build-style' \
		'  make build-components' \
		'  make build-the-wheels' \
		'  make build-kitchen-sink' \
		'  make build-storybook' \
		'  make test-components' \
		'  make test-package' \
		'  make test-e2e' \
		'' \
		'Rulesets: make ruleset-help'

dev-kitchen-sink:
	cd "$(DEV_DIR)" && npm run dev:kitchen-sink

preview-kitchen-sink:
	cd "$(DEV_DIR)" && npm run preview:kitchen-sink

dev-storybook:
	cd "$(DEV_DIR)" && npm run dev:storybook

build-style:
	cd "$(DEV_DIR)" && npm run build:style

build-components:
	cd "$(DEV_DIR)" && npm run build:components

build-the-wheels:
	cd "$(DEV_DIR)" && npm run build:the-wheels

build-kitchen-sink:
	cd "$(DEV_DIR)" && npm run build:kitchen-sink

build-storybook:
	cd "$(DEV_DIR)" && npm run build:storybook

test-components:
	cd "$(DEV_DIR)" && npm run test:components

test-package:
	cd "$(DEV_DIR)" && npm run test:package

test-e2e:
	cd "$(DEV_DIR)" && npm run test:e2e

ruleset-help:
	@printf '%s\n' \
		'Targets:' \
		'' \
		'  make ruleset-create RULESET_REPO=OWNER/NAME [RULESET_VISIBILITY=public] [RULESET_CREATE_FLAGS="--clone"]' \
		'      Create a GitHub repo and apply rulesets.' \
		'' \
		'  make ruleset-apply [RULESET_REPO=OWNER/NAME]' \
		'      Apply/update rulesets on an existing repo (defaults to current gh repo).' \
		'' \
		'  make ruleset-check [RULESET_REPO=OWNER/NAME] [RULESET_BRANCH=main]' \
		'      List rulesets and check which rules apply to RULESET_BRANCH.' \
		'' \
		'Notes:' \
		'  - GitHub Free (org): rulesets work on public repos only.' \
		'  - Requires gh (repo admin) and jq.' \
		'  - Namespaced as ruleset-* / RULESET_* for subtree-safe includes.'

ruleset-create:
	@if [ -z "$(RULESET_REPO)" ]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required" >&2; \
		echo "example: make ruleset-create RULESET_REPO=my-org/new-app" >&2; \
		exit 1; \
	fi
	@"$(RULESET_SCRIPTS)/create-repo-with-rulesets.sh" "$(RULESET_REPO)" "--$(RULESET_VISIBILITY)" $(RULESET_CREATE_FLAGS)

ruleset-apply:
	@repo="$(RULESET_REPO)"; \
	if [ -z "$$repo" ]; then repo="$(RULESET_CURRENT_REPO)"; fi; \
	if [ -z "$$repo" ]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required (or run inside a gh-resolved checkout)" >&2; \
		echo "example: make ruleset-apply RULESET_REPO=my-org/existing-app" >&2; \
		exit 1; \
	fi; \
	"$(RULESET_SCRIPTS)/apply-rulesets.sh" --repo "$$repo"

ruleset-check:
	@repo="$(RULESET_REPO)"; \
	if [ -z "$$repo" ]; then repo="$(RULESET_CURRENT_REPO)"; fi; \
	if [ -z "$$repo" ]; then \
		echo "error: RULESET_REPO=OWNER/NAME is required (or run inside a gh-resolved checkout)" >&2; \
		echo "example: make ruleset-check RULESET_REPO=my-org/existing-app RULESET_BRANCH=main" >&2; \
		exit 1; \
	fi; \
	echo "== ruleset list =="; \
	gh ruleset list -R "$$repo"; \
	echo; \
	echo "== ruleset check $(RULESET_BRANCH) =="; \
	gh ruleset check "$(RULESET_BRANCH)" -R "$$repo"
