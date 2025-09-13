# mrgo

mrgo is a serverless URL shortener

## Prerequisites

- [Nix](https://nixos.org/download.html) with flakes enabled

## Local Development

This project uses Nix flakes for reproducible development environments.

### Quick Start

```bash
# Enter the development shell
nix develop
# Or use direnv
echo "use flake" > .envrc
```

### Development Scripts

Development workflow scripts are available in the Nix shell:

```bash
format # format code
lint   # run all linters
deploy # deploy infrastructure
```

## Project Structure

- `nix/`: nix overlays, modules, and service definitions
  - `mrgo.nix`: main application nix derivation
- `packages/`: application source code
  - `api/`: rest api
  - `core/`: shared business logic and database schemas
  - `lambda/`: aws lambda function wrapper
- `infra/`: infrastructure as code
  - `.env`: base configuration
  - `.env.<env>`: environment-specific configuration
  - `<component>/`: component-specific infrastructure
- `scripts/`: build and deployment scripts
  - `utils/`: shared utility scripts
  - `local/`: local development scripts
  - `dev/`: development workflow scripts

## Deployment

### Environment Configuration

Deployments use environment-specific configuration files:

- `infra/.env`: Base configuration (all environments)
- `infra/.env.<environment>`: Environment-specific overrides

### Deploying

```bash
# Deploy to your personal development environment
deploy

# Deploy to a specific environment
deploy dev
```

The deployment script will:

1. Build all artifacts
2. Create CloudFormation changesets
3. Show you the planned changes
4. Ask for confirmation before applying
5. Deploy components in dependency order

## Troubleshooting

### NPM Workspace Issues

If you encounter `ENOTCACHED` errors during Nix builds:

- ensure `package-lock.json` has integrity hashes
- run `npm install` to regenerate the lock file
- see [nixpkgs issue #408720](https://github.com/nixos/nixpkgs/issues/408720)
