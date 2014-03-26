MODS := ./node_modules
BINS := ./node_modules/.bin

all: install test test-browser build

install:
	@ npm install

jshint: index.js lib/*.js test/*.js
	@ $(BINS)/jshint $^

test: test-node test-browser

# Start node with the harmony flag turned on to run the tests in a native
# WeakMap environment.
test-node: jshint
	@ node --harmony $(BINS)/tape test/*.js

# Run the tests in a headless browser using testling and a WeakMap shim.
test-browser: jshint
	@ (cat $(MODS)/es5-shim/es5-shim.js \
			; cat $(MODS)/weakmap/weakmap.js \
			; $(BINS)/browserify test/*.js) \
		| $(BINS)/testling

build: jshint
	@ cp $(MODS)/es5-shim/es5-shim.js test/browser/es5-shim.js
	@ cp $(MODS)/weakmap/weakmap.js test/browser/weakmap.js
	@ $(BINS)/browserify -s PrivateParts index.js \
		| $(BINS)/uglifyjs \
		> private-parts.js

.PHONY: all install test test-node test-browser build
