mods := ./node_modules
bins := ./node_modules/.bin
src := index.js
test := test/*.js test/fixtures/*.js

all: install test build

install:
	@ npm install

lint: $(src) $(test)
	@ $(bins)/jshint --verbose $^

# Start node with the harmony flag turned on to run the tests in a native
# WeakMap environment.
test-node: lint
	@ node --harmony $(bins)/tape test/*.js

# Run the tests in a headless browser using testling and a WeakMap shim.
test-browser: lint
	@ cp $(mods)/weakmap/weakmap.js test/browser/weakmap.js
	@ $(bins)/browserify test/*.js > test/browser/bundle.js
	@ $(bins)/testling

test: test-node test-browser

private-parts.js: $(src)
	@ $(bins)/browserify -s PrivateParts index.js \
		| $(bins)/uglifyjs \
		> private-parts.js

build: lint private-parts.js
	@ cp $(mods)/weakmap/weakmap.js test/browser/weakmap.js

.PHONY: all install lint test test-node test-browser build
