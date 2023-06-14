Setting up a "test" mongo database
https://yosh.ke.mu/mongo_in_docker

Test database will be used during development to avoid corrupting real member data on the production database.

The way it works:

- docker-compose sets up db-mongo service builds a container that uses a mongo image
- test username and password set up in docker-compose file environment variables
- volumes linked to test_database directory so that data persists between sessions

Use a mongodb client like MongoDB Compass to connect and access data
