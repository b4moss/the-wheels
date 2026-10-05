# npm workspace lives in dev/. Root `make` targets wrap `npm run *` there.
# Target names replace `:` in script names with `-` (e.g. build:style → build-style).

SHELL := /bin/bash

ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
DEV_DIR := $(ROOT_DIR)/dev

ifeq ($(abspath $(firstword $(MAKEFILE_LIST))),$(ROOT_DIR)/Makefile)
.DEFAULT_GOAL := help
endif

.PHONY: help \
	dev-kitchen-sink preview-kitchen-sink dev-storybook \
	build-style build-components build-the-wheels build-kitchen-sink build-storybook build-pages \
	test-components test-package test-e2e

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
		'  make build-pages' \
		'  make test-components' \
		'  make test-package' \
		'  make test-e2e'

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

build-pages:
	cd "$(DEV_DIR)" && npm run build:pages

test-components:
	cd "$(DEV_DIR)" && npm run test:components

test-package:
	cd "$(DEV_DIR)" && npm run test:package

test-e2e:
	cd "$(DEV_DIR)" && npm run test:e2e
