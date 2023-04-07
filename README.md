# MrGo

MrGo is a serverless URL shortener

## Project Layout

- `integration-tests/` - this contains post-deploy integration tests
- `templates/` - this directory contains the CloudFormation IaC that will be used to define the application. It's designed in a nested stack manner, with the `template.yml` being the template for the parent stack and templates in `templates/` being used for all nested stacks
- `backend/` - this is the root directory for all backend lambda/custom code
- `openapi/` - this directory contains assets that can be used to render the OpenAPI editor, useful to view and validate your OpenAPI documentation

## CI/CD

Makefiles are used throughout the project to handle defining various development workflow commands that need to be run throughout CI/CD. This includes running unit tests, building code, deployment, and integration tests.

The following "CI/CD" entrypoints are defined:

- `test` - running the unit test suite for the application. Peripheral targets are defined (like `coverage` to generate code coverage reports and `debug` to attach a debugger to the test execution)
- `package` - produce an `artifacts/template.packaged.yml`. This file is generated from a `sam package` command. It will also zip the codebase into `artifacts/backend.zip` in a deterministic way, helping to ensure your lambda functions don't unnecessarily get updated
- `create-change-set`, `deploy-change-set` - creates a CloudFormation changeset, then logs that changeset in a human-friendly way, and finally deploys that change set
- `integration-test` - run the integration test suite for the application

CI/CD will depend on the following variables:

- `APPLICATION_NAME` - the name of the application you're deploying
- `ENVIRONMENT_NAME` - the name of the environment you're deploying to
- `ARTIFACT_BUCKET` - the name of the bucket you'd like to upload code artifacts to
- `ARTIFACT_PREFIX` - a prefix to upload the code to within the artifact bucket

AWS IAM access is handled via IAM roles. This uses the `aws-actions/configure-aws-credentials` action to get credentials from an OIDC provider. To learn more about that, check out [this article](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).
