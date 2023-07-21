# Default script that gets run when only 'make' is run
.DEFAULT_GOAL := clean-frontend-db


# Cleans up docker containers, volumes, and networks in project (fresh start)
clean:
	docker-compose down -v
	docker image prune -f

# Frontend, Backend, and Database
clean-full-test: clean
	docker-compose up --build

full-test:
	docker-compose up

# Frontend
clean-frontend: clean
	docker-compose up --build frontend

frontend:
	docker-compose up frontend

# Frontend and Database
clean-frontend-db: clean
	docker-compose up --build db frontend

frontend-db:
	docker-compose up db frontend

# Backend and Database
clean-backend-db: clean
	docker-compose up --build db backend

backend-db:
	docker-compose up db backend

# Database
clean-db: clean
	docker-compose up --build db

db:
	docker-compose up db
	

# Access Docker Container Shells
frontend-shell:
	docker exec -t -i next_portal_frontend_container /bin/bash

backend-shell:
	docker exec -t -i next_portal_backend_container /bin/bash

# Open Jest Coverage Report
open-jest-report:
	open ./client/coverage/lcov-report/index.html


# Test Deploy
test-deploy:
	touch test_deploy && echo "Unique Text: $$(uuidgen)" > test_deploy && git add test_deploy && git commit -m "testing deployment" && git push && rm test_deploy