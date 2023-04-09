MAKEFLAGS=--warn-undefined-variables

STACK_NAME ?= ${APPLICATION_NAME}-${ENVIRONMENT_NAME}
AWS_REGION ?= us-east-2
TEST_ARGS ?=

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
	mkdir -p artifacts
	rm -rf artifacts/backend.zip
	find ./backend/* -exec touch -h -t 200101010000 {} +
	cd backend && zip -r -D -9 -y --compression-method deflate -X -x @../package-exclusions.txt @ ../artifacts/backend.zip * | grep -v 'node_modules'
	@echo "zip file MD5: $$(cat artifacts/backend.zip | openssl dgst -md5)"

artifacts/frontend.zip: $(shell find ./frontend -name '*.*js') node_modules backend/node_modules backend/openapi.packaged.json
	mkdir -p artifacts
	rm -rf artifacts/frontend.zip
	find ./frontend/* -exec touch -h -t 200101010000 {} +
	cd frontend && zip -r -D -9 -y --compression-method deflate -X -x @../package-exclusions.txt @ ../artifacts/frontend.zip * | grep -v 'node_modules'
	@echo "zip file MD5: $$(cat artifacts/frontend.zip | openssl dgst -md5)"

artifacts/template.packaged.yml: template.yml artifacts/backend.zip artifacts/frontend.zip
	mkdir -p artifacts
	sam package \
		--template-file template.yml \
		--s3-bucket "${ARTIFACT_BUCKET}" \
		--s3-prefix "${ARTIFACT_PREFIX}" \
		--output-template-file artifacts/template.packaged.yml
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
	./node_modules/.bin/env-cmd -f ./.env.test ./node_modules/.bin/mocha './backend/{,!(node_modules)/**}/*.spec.js' ${TEST_ARGS}
coverage:
	./node_modules/.bin/nyc $(MAKE) test
debug:
	$(MAKE) test TEST_ARGS="--inspect-brk"

package: artifacts/template.packaged.yml

create-change-set:
	@echo "Deploying ${STACK_NAME} with changeset ${CHANGE_SET_NAME}"
	export STACK_STATUS=$$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query Stacks[0].StackStatus --output text 2> /dev/null || echo "NO_STACK"); \
	aws cloudformation create-change-set \
		--stack-name ${STACK_NAME} \
		--template-body file://artifacts/template.packaged.yml \
		--parameters \
			ParameterKey=ApplicationName,ParameterValue='"${APPLICATION_NAME}"' \
			ParameterKey=EnvironmentName,ParameterValue='"${ENVIRONMENT_NAME}"' \
			ParameterKey=HostedZoneName,ParameterValue='"${HOSTED_ZONE_NAME}"' \
			ParameterKey=DomainName,ParameterValue='"${DOMAIN_NAME}"' \
		--tags \
			Key=ApplicationName,Value=${APPLICATION_NAME} \
			Key=EnvironmentName,Value=${ENVIRONMENT_NAME} \
		--capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM CAPABILITY_IAM \
		--change-set-name "${CHANGE_SET_NAME}" \
		--description "${CHANGE_SET_DESCRIPTION}" \
		--include-nested-stacks \
		--change-set-type $$(`echo "NO_STACK,REVIEW_IN_PROGRESS" | grep -w -q "$${STACK_STATUS}"` && echo "CREATE" || echo "UPDATE")
	@echo "Waiting for change set to be created..."
	@CHANGE_SET_STATUS=None; \
	while [[ "$$CHANGE_SET_STATUS" != "CREATE_COMPLETE" && "$$CHANGE_SET_STATUS" != "FAILED" ]]; do \
		CHANGE_SET_STATUS=$$(aws cloudformation describe-change-set --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME} --output text --query 'Status'); \
	done; \
	aws cloudformation describe-change-set --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME} > artifacts/${STACK_NAME}-${CHANGE_SET_NAME}.json; \
	if [[ "$$CHANGE_SET_STATUS" == "FAILED" ]]; then \
		CHANGE_SET_STATUS_REASON=$$(aws cloudformation describe-change-set --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME} --output text --query 'StatusReason'); \
		if [[ "$$CHANGE_SET_STATUS_REASON" == "The submitted information didn't contain changes. Submit different information to create a change set." ]]; then \
			echo "ChangeSet contains no changes."; \
		else \
			echo "Change set failed to create."; \
			echo "$$CHANGE_SET_STATUS_REASON"; \
			exit 1; \
		fi; \
	fi;
	@echo "Change set ${STACK_NAME} - ${CHANGE_SET_NAME} created."
	npx cfn-changeset-viewer --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME}

deploy-change-set: node_modules
	CHANGE_SET_STATUS=$$(aws cloudformation describe-change-set --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME} --output text --query 'Status'); \
	if [[ "$$CHANGE_SET_STATUS" == "FAILED" ]]; then \
		CHANGE_SET_STATUS_REASON=$$(aws cloudformation describe-change-set --stack-name ${STACK_NAME} --change-set-name ${CHANGE_SET_NAME} --output text --query 'StatusReason'); \
		echo "$$CHANGE_SET_STATUS_REASON"; \
		if [[ "$$CHANGE_SET_STATUS_REASON" == "The submitted information didn't contain changes. Submit different information to create a change set." ]]; then \
			echo "ChangeSet contains no changes."; \
		else \
			echo "Change set failed to create."; \
			exit 1; \
		fi; \
	else \
		aws cloudformation execute-change-set \
			--stack-name ${STACK_NAME} \
			--change-set-name ${CHANGE_SET_NAME}; \
	fi;
	npx cfn-event-tailer ${STACK_NAME}
	aws cloudformation describe-stacks \
		--stack-name ${STACK_NAME} \
		--query Stacks[0].Outputs[].[OutputKey,OutputValue] \
		--output table

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
