
all: build test

init:
	npm install > /dev/null

build: init
	grunt > /dev/null

test: init
	grunt test



