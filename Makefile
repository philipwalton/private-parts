all: install test

install:
	@ npm install

test:
	@ @jshint *.js lib/*.js test/*.js
	@ node_modules/.bin/mocha --harmony --reporter spec

.PHONY: all install test