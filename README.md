## Style Conventions

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
