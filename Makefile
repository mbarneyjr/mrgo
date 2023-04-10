MAKEFLAGS=--warn-undefined-variables

export STACK_NAME ?= ${APPLICATION_NAME}-${ENVIRONMENT_NAME}
export AWS_REGION ?= us-east-2
export TEST_ARGS ?=

node_modules: package-lock.json
	npm ci
	touch node_modules
backend/node_modules: backend/package-lock.json
	cd backend && npm ci
frontend/node_modules: frontend/package-lock.json
	cd frontend && npm ci
integration-tests/node_modules: integration-tests/package-lock.json
	cd integration-tests && npm ci

backend/openapi.packaged.json: templates/api.yml
	cat ./templates/api.yml | yq .Resources.Api.Properties.DefinitionBody > backend/openapi.packaged.json

artifacts/backend.zip: $(shell find ./backend -name '*.*js') node_modules backend/node_modules backend/openapi.packaged.json
	./scripts/build-artifact.sh backend

artifacts/frontend.zip: $(shell find ./frontend -name '*.*js') node_modules backend/node_modules backend/openapi.packaged.json
	./scripts/build-artifact.sh frontend

artifacts/template.packaged.yml: template.yml artifacts/backend.zip artifacts/frontend.zip
	./scripts/package.sh
	touch artifacts/template.packaged.yml

.PHONY: frontend/.env
frontend/.env:
	rm -rf frontend/.env
	touch frontend/.env
	echo "LOCAL=true" >> frontend/.env
	echo "APP_CLIENT_ID=$$(aws ssm get-parameter --query Parameter.Value --output text --name /${APPLICATION_NAME}/${ENVIRONMENT_NAME}/auth/app-client-id)" >> frontend/.env
	echo "AUTH_BASE_URL=$$(aws ssm get-parameter --query Parameter.Value --output text --name /${APPLICATION_NAME}/${ENVIRONMENT_NAME}/auth/auth-base-url)" >> frontend/.env
	echo "API_ENDPOINT=$$(aws ssm get-parameter --query Parameter.Value --output text --name /${APPLICATION_NAME}/${ENVIRONMENT_NAME}/api/api-endpoint)" >> frontend/.env
	echo "APP_ENDPOINT=http://localhost:3000" >> frontend/.env

### PHONY dependencies
.PHONY: dependencies lint build test coverage debug package create-change-set deploy-change-set integration-test delete openapi-server clean

dependencies: node_modules backend/node_modules frontend/node_modules integration-tests/node_modules
	pip install -r requirements.txt

lint: dependencies
	./node_modules/.bin/tsc -p ./tsconfig.json
	./node_modules/.bin/eslint . --max-warnings=0 --ext .mjs,.js,.ts
	cfn-lint

build: artifacts/backend.zip artifacts/frontend.zip

test: backend/openapi.packaged.json
	./node_modules/.bin/env-cmd -f ./.env.test ./node_modules/.bin/mocha './backend/{,!(node_modules)/**}/*.spec.mjs' ${TEST_ARGS}
coverage:
	./node_modules/.bin/nyc $(MAKE) test
debug:
	$(MAKE) test TEST_ARGS="--inspect-brk"

package: artifacts/template.packaged.yml

create-change-set:
	./scripts/create-change-set.sh

deploy-change-set: node_modules
	./scripts/deploy-change-set.sh

integration-test: node_modules integration-tests/node_modules
	export API_ENDPOINT=$$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text); \
	export USER_POOL_ID=$$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text); \
	export APP_CLIENT_ID=$$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey=='AppClientId'].OutputValue" --output text); \
	./node_modules/.bin/env-cmd -f ./.env.integration.test ./node_modules/.bin/mocha --timeout 6000 './integration-tests/{,!(node_modules)/**}/*.test.mjs'

delete:
	aws cloudformation delete-stack --stack-name ${STACK_NAME}

local-server: frontend/node_modules
	cd frontend && npm start

openapi-server:
	live-server openapi &
	npx nodemon --watch ./templates/api.yml --exec 'yq .Resources.Api.Properties.DefinitionBody < ./templates/api.yml > openapi/openapi.packaged.json'

clean:
	rm -rf .nyc_output
	rm -rf artifacts
	rm -rf coverage
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf integration-tests/node_modules
	rm -rf backend/openapi.packaged.json
	rm -rf openapi/openapi.packaged.json
