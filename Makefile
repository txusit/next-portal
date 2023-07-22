# Default script that gets run when only 'make' is run
.DEFAULT_GOAL := clean-app-db


# Cleans up docker containers, volumes, and networks in project (fresh start)
clean:
	docker-compose down -v
	docker image prune -f

# app
clean-app: clean
	docker-compose up --build app

app:
	docker-compose up app

# app and Database
clean-app-db: clean
	docker-compose up --build db app

app-db:
	docker-compose up db app

# Database
clean-db: clean
	docker-compose up --build db

db:
	docker-compose up db

# Access Docker Container Shells
app-shell:
	docker exec -t -i next_portal_app_container /bin/bash

# Open Jest Coverage Report
open-jest-report:
	open ./client/coverage/lcov-report/index.html


# Test Deploy
test-deploy:
	touch test_deploy && echo "Unique Text: $$(uuidgen)" > test_deploy && git add test_deploy && git commit -m "testing deployment" && git push && rm test_deploy