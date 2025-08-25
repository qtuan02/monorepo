APP        ?= golang-gin
BIN_DIR    ?= ./tmp
MAIN_PKG   ?= ./cmd/api
AIR        ?= air

GOCACHE    ?= $(CURDIR)/.gocache
GOMODCACHE ?= $(CURDIR)/.gomodcache
export GOCACHE
export GOMODCACHE

ifeq ($(OS),Windows_NT)
  EXT := .exe
else
  EXT :=
endif

BIN := $(BIN_DIR)/$(APP)$(EXT)

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c

.DEFAULT_GOAL := help
.PHONY: prepare deps dev build run start clean clean-all


help:
	@echo "  dev: make dev        		- start in dev mode (Air hot reload)"
	@echo "  build: make build   	    - build binary"
	@echo "  run: make run      	    - run built binary"
	@echo "  start: make start          - alias of run"
	@echo "  deps: make deps   		    - tidy & download Go modules"
	@echo "  clean: make clean		    - remove build artifacts"
	@echo "  clean-all: make clean-all  - remove build artifacts + go mod cache"

prepare:
	@mkdir -p ".gocache" ".gomodcache" "$(BIN_DIR)"

deps:
	@echo ">> Installing Go modules..."
	@go mod tidy
	@go mod download

dev: prepare
	@command -v $(AIR) >/dev/null 2>&1 && { \
		echo ">> Starting dev server (Air hot reload)..."; \
		$(AIR); \
	} || { \
		echo "!! Air not found. Fallback to: go run $(MAIN_PKG)"; \
		go run $(MAIN_PKG); \
	}

build: prepare
	@echo ">> Building -> $(BIN)"
	@go build -o "$(BIN)" "$(MAIN_PKG)"

run: build
	@echo ">> Starting binary..."
	@"$(BIN)"

start: run

clean:
	@echo ">> Cleaning build artifacts..."
	@rm -rf "$(BIN_DIR)"

clean-all: clean
	@echo ">> Cleaning module cache..."
	@go clean -modcache
	@echo ">> Removing local caches & logs..."
	@rm -rf ".gocache" ".gomodcache" "logs"
	@echo ">> Removing go.sum..."
	@rm -f go.sum
