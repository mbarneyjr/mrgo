# Decisions

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
