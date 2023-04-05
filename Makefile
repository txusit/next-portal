# Default script that gets run when only 'make' is run
.DEFAULT_GOAL := clean-full-test


# Cleans up docker containers, volumes, and networks in project (fresh start)
clean:
	docker-compose down -v

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

# Backend and Database
clean-backend-db: clean
	docker-compose up --build db backend

backend-db:
	docker-compose up db backend


# Access Docker Container Shells
frontend-shell:
	docker exec -t -i next_portal_frontend_container /bin/bash

backend-shell:
	docker exec -t -i next_portal_backend_container /bin/bash