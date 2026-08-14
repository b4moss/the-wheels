# GitHub repository ruleset helpers.
# Real work lives in scripts/; this Makefile is a thin wrapper.
# Target/variable names are prefixed with ruleset- / RULESET_ so this
# file can be vendored via git subtree without colliding with host Makefiles.

SHELL := /bin/bash

RULESET_ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
RULESET_SCRIPTS := $(RULESET_ROOT_DIR)/scripts

# Only take over the default goal when this file is the primary Makefile.
ifeq ($(abspath $(firstword $(MAKEFILE_LIST))),$(RULESET_ROOT_DIR)/Makefile)
.DEFAULT_GOAL := ruleset-help
endif

# Explicit override wins. Otherwise apply/check resolve via `gh repo view`
# (canonical nameWithOwner — avoids HTTP 307 on renamed remotes).
RULESET_REPO ?=
RULESET_BRANCH ?= main
RULESET_VISIBILITY ?= public
RULESET_CREATE_FLAGS ?=

RULESET_CURRENT_REPO = $(shell gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

.PHONY: ruleset-help ruleset-create ruleset-apply ruleset-check

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
