# Decisions

## Use Hono for the API Framework

Hono will be used as the framework for the API. Hono's Zod OpenAPI middleware
will be used to expose an OpenAPI specification. Hono's Swagger UI middleware
will offer an endpoint to browse the OpenAPI spec with the official OpenAPI UI.
Zod will be used to define the schemas for any request/response bodies, params,
etc for a full type-safe API implementation.

A local server will be implemented using Hono's Node Server to support running a
local development environment.

## Use Drizzle to Build Queries and Manage Migraitons

Drizzle will be used to manage database migrations and serve as an ORM/SQL
query builder. Drizzle Studio will also be used to facilitate local access to
the database. Drizzle does a great job at enabling type-safe access to a SQL
database while still feeling closer to the SQL than a typical ORM.

Drizzle config and database migrations will be maintained in the `packages/core`
workspace. That workspace should have npm commands to generate the migrations,
apply the migrations, and run Drizzle Studio.

## Build with a Deterministic Zip Approach

When building the lambda deployment aritfact, a deterministic zip file will be
produced, as best as possible. Often when zipping files across multiple places,
even if the content of the files are the same, will produce a zip file with
differing bytes. This makes it tough to know if something has actually changed
with your zipped contents by looking at the file. If a new deployment is
created, but no actual application code has changed, an update of the lambda
functions should not be performed. In order to achieve this, we will do a
number of things when running `zip` to produce the Lambda deployment artifact:

- ensure all files have the same timestamp
- `zip` without extra metadata

The specific implementation can be found in the Nix derivation for the lambda
deployment artifact, specifically in the `postInstall` hook.

## Use Linting and Formatting Tools

Linting tools will be used where appropriate:

- `shellcheck` for shell scripts
- `sort-package-json` for package.json files
- `tsc` for type-checking typescript files
- `biome` for linting typescript files

Formatting tools will also be used where appropriate:

- `prettier` for json, markdown, etc.
- `sort-package-json` for package.json files
- `biome` for linting typescript files

Linting should be enabled and run with the primary focus to catch as many errors
before runtime as possible. Formatting should be enabled and run to prevent
spending too much time thinking about how the code is formatted. As long as the
tool produces something standard, we should stick to it.

## Use NodeJS for the Runtime

NodeJS will be used as the runtime for this serverless app. NodeJS is a very
common runtime for serverless apps. Application will be written in TypeScript,
but will not be compiled. Instead, the type stripping and type transforming
features of NodeJS will be used.

NPM Workspaces will be used to separate individual components of the app. All
business logic should go in the `packages/core` workspace. `packages/api` should
have an API implemented. The Lambda function handler must be written in pure
JavaScript, but another NPM workspace will be utilized specifically for the
lambda handler (in `packages/lambda`). All that it should be responsible for is
minimally-wrapping the lambda entrypoint.

## Use Nix

Nix will be used as the build system and development environment for `mrgo`. It
will be used with Flakes, utilizing flake-parts as well as services-flake for
running a local development environment. The development environment should have
the tools needed to work on the project, including building, linting, testing,
formatting, and deploying.

## Create Mr. Go

Mr. Go, a serverless URL-shortener, will be created. The purpose of Mr. Go is
more than just to be a URL shortener. Mr. Go should serve as a reference for
how I plan on building serverless web applications. I want to have a repository
that is well-structured, code that is easily maintained, a reproducible build
process, and a development flow that is easy to work with.
