# Decisions

## Use GitHub Actions for CI/CD

GitHub Actions will be used for CI/CD. The app code is already maintained in
GitHub, so GitHub Actions is the default choice.

CI/CD should be built to facilitate a build-once, deploy-many pattern. Every
commit should be built and tested, which happens as its own pipeline. Then, the
deployment pipelines can be triggered from that build workflow. The `dev`
workflow will be triggered from all builds from the `main` branch. The `qa`
workflow will be triggered from all builds from tags matching a semver version.
The `prod` workflow will be manually triggered, specifying a tag. All deploy
workflows will reference the previously-built artifact, and not rebuild the app.

For ephemeral environments, a separate workflow will be used to deploy based on
GitHub Pull Requests. To configure an ephemeral environment, such as specifying
to use a shared `dev` database environment, GitHub PR labels will be used. When
a PR is merged, a cleanup workflow will be triggered that's responsible for
deleting the deployed ephemeral environment.

## Use Services Flake for Spinning up a Local Development Environment

Services-Flake will be used to facilitate the ability to run the entire app
locally. A single command should be used to spin up a local database, database
migrations, the API, and every other component that is used to run the app.

## Support Shared Resources

Personal and ephemeral development environments should have the ability to share
infrastructure components. For example, a developer's personal development
environment should be able to use the main development environment's database
instead of requiring that every personal and ephemeral development environment
instantiate the full stack for the application.

This will be facilitated by specifying the `${COMPONENT_NAME}_ENVIRONMENT_NAME`
environment variable when running the deploy script. For instance, to deploy
an environment but utilize the `dev` environment's database, the following
command would be used:

```sh
$ DATABASE_ENVIRONMENT_NAME=dev deploy
```

There will be a dependency grpah for all of the infrastructure components. For
instance, a `frontend` will depend on an `api` component, which depends on the
`auth` and `database` components. If you deploy a new environment, but specify
the `API_ENVIRONMENT_NAME` variable to use the dev environment's `api`, the
environment will not create its own `api`, or any component the `api` depends
on, such as the `database` or `auth` components.

## Manage Deployment Configuration Within the Repository

Configuration files will be used to manage the configuration of the deployment
process. Since the Infrastructure-as-Code tool is CloudFormation, configuration
will take the form of CloudFormation parameters and stack tags. A `.env` file
will be used to manage global configuration options. For environment-specific
configuration, `.env.${ENVIRONMENT_NAME}` files will be used. This will apply
within the `infra/` directory for all component deployments and within the
`infra/${COMPONENT_NAME}/` directory for component-specific configuration.

Sane defaults should be used for most if not all configuration options. It
should be pretty easy for anyone to clone this repo and immediately deploy
to a personal development environment without configuring an environment file.

## Support Local Deployment

A deployment script will be created that facilitates an easy local deployment
process. This will take the form of another bash script, accessible from the
Nix dev shell. It's important to be able to deploy locally and not be heavily
reliant on CI for personal/ephemeral development environments.

## Use CloudFormation for Infrastructure-as-Code

CloudFormation will be used as the primary Infrastructure-as-Code tool. CFN is
chosen primarily because it is the most portable and reproducible tool. Each
template can be deployed without requiring the use of another tool, framework,
or environment. A template that works now will also continue to work in the
future. With tools like `cfn-lint` and `cfn-lsp-extra`, a lot of the benefits
of something like CDK/SST can be realized, without many of the design quirks.

All IaC will be maintained within the `infra/` directory. Each infrastructure
component will be maintained in an `infra/${COMPONENT_NAME}` directory, such
as the `infra/api/` and `infra/database/` directories.

`cfn-lint` will be used as the linter for all CloudFormation templates.

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
