MODS := ./node_modules/.bin

all: install test test-browser build

install:
	@ npm install

jshint:
	$(MODS)/jshint *.js lib/*.js test/*.js

test: test-node test-browser

# Start node with the harmony flag turned on
# to run the tests in a native WeakMap environment.
test-node: jshint
	node --harmony $(MODS)/tape test/*.js

# Run the tests in a headless browser using a
# testling and a WeakMap shim.
test-browser: jshint
	# I have to copy here because testling doesn't seem to work
	# with files in the node_modules directory.
	cp ./node_modules/weakmap/weakmap.js test/browser/weakmap.js
	$(MODS)/browserify test/*.js > test/browser/bundle.js
	$(MODS)/testling

build:
	@ $(MODS)/browserify -s PrivateParts index.js \
		| $(MODS)/uglifyjs \
		> dist/private-parts.js

.PHONY: all install test
