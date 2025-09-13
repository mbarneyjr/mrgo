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
```

## Project Structure

- `nix/`: nix overlays, modules, and service definitions
  - `mrgo.nix`: main application nix derivation
- `packages/`: application source code
  - `api/`: rest api
  - `core/`: shared business logic and database schemas
  - `lambda/`: aws lambda function wrapper
- `scripts/`: build and deployment scripts
  - `dev/`: development workflow scripts

## Troubleshooting

### NPM Workspace Issues

If you encounter `ENOTCACHED` errors during Nix builds:

- ensure `package-lock.json` has integrity hashes
- run `npm install` to regenerate the lock file
- see [nixpkgs issue #408720](https://github.com/nixos/nixpkgs/issues/408720)
