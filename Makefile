build: FORCE
	npm run build
	go build -o build/server src/server.go 

FORCE: ;