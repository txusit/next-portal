# Default script that gets run when only 'make' is run
.DEFAULT_GOAL := clean-portal


# Cleans up docker containers, volumes, and networks in project (fresh start)
clean:
	docker-compose down -v
	docker image prune -f

# portal
clean-portal: clean
	docker-compose up --build portal

portal:
	docker-compose up portal

# portal and Database
# clean-portal-db: clean
# 	docker-compose up --build db portal

# portal-db:
# 	docker-compose up db portal

# Database
# clean-db: clean
# 	docker-compose up --build db

# db:
# 	docker-compose up db

db:
	supabase start

db-stop:
	supabase stop

# Create a new DB migration file for changes to schemas. Make sure to add RPC functions manually
db-migration-new: 
	supabase migration new ${name}

# Access Docker Container Shells
portal-shell:
	docker exec -t -i next_portal_portal_container /bin/bash

# Run Jest Unit and Integration Tests
test:
	npm run test

# Open Jest Coverage Report
open-jest-report:
	open ./client/coverage/lcov-report/index.html


# Test Deploy
test-deploy:
	touch test_deploy && echo "Unique Text: $$(uuidgen)" > test_deploy && git add test_deploy && git commit -m "testing deployment" && git push && rm test_deploy