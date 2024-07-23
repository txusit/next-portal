## Style Conventions

Variable:
lower-kebab-case

Components:
PascalCase

Non-component files:
lower-kebab-case

Directories:
lower-kebab-case

Try catch (error):

narrow error type using instanceof:

- if (error instanceof Error)
- if (error instanceof ApiError)

for unknown error types, throw new ApiError(statusCode, "unknown error message of some sort")

Relay error by throwing new ApiError

## Project File Structure Conventions

https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md

## Supabase Instances

Production

- Hosted by Supabase.com
- Holds real user-facing data

Development

- Hosted by Supabase.com
- Holds the pre-production data
- Used to validated features in a production-like setting before it goes live

Local (Dev/Test)

- Hosted by local machine
- Holds data created in the development process in a sandbox environment
- Holds data created by test suites (rolledback)

CI/CD

- Hosted in "local machine" by Github actions
- Holds data created during test runs in the deployment pipeline
