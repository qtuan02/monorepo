BINARY_NAME ?= golang-gin
BIN_DIR     ?= ./tmp
MAIN_PKG    ?= ./cmd/api
EXT         :=
AIR         ?= air

ifeq ($(OS),Windows_NT)
	EXT := .exe
endif

BIN := $(BIN_DIR)/$(BINARY_NAME)$(EXT)

.PHONY: dev build start d download clean clean_all

d download:
	@echo "Installing Go modules..."
	@go mod tidy
	@go mod download

dev:
	@command -v $(AIR) >/dev/null 2>&1 || { echo "Air not installed. Run: go install github.com/air-verse/air@latest"; exit 1; }
	@echo "Starting dev server (Air hot reload)..."
	@$(AIR)

$(BIN_DIR):
	@mkdir -p $(BIN_DIR) 2>/dev/null || mkdir $(BIN_DIR) 2> NUL || true

build: $(BIN_DIR)
	@echo "Building -> $(BIN)"
	@go build -o $(BIN) $(MAIN_PKG)

start: build
	@echo "Starting binary..."
	@$(BIN)

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BIN_DIR) 2>/dev/null || rmdir /S /Q $(BIN_DIR) 2> NUL || true

clean_all: clean
	@echo "Cleaning all..."
	@go clean -modcache
