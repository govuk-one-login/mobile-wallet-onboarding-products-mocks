# Mobile Wallet Status List Mock

## Overview

This is a mock implementation of the Status List service used by GOV.UK Wallet to check the current status of its stored credentials. It is designed for integration with the Example Credential Issuer (CRI) and GOV.UK Wallet in development and build environments only.

## Tech stack

This service is built with TypeScript and Node.js, deployed as AWS Lambda functions behind an API Gateway. It uses S3 for storage and KMS for signing, with infrastructure managed via AWS SAM.

## Prerequisites

- [Node.js](https://nodejs.org/en) — we recommend managing versions with [nvm](https://github.com/nvm-sh/nvm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required to run LocalStack locally and to build the app image

## Set up locally

### Install

```bash
npm install
```

### Checkov

We use Checkov for static analysis of our IaC. Following can be used to run a Checkov analysis locally.

```bash
brew install checkov

# Running Checkov analysis
npm run checkov
```

### Lint and format

```bash
npm run lint:fix
npm run format
```

### Build

Build the SAM template:

```
npm run build
```

### Run

Create a local environment file:

```bash
cp .env.json.example .env.json
```

Start LocalStack.
Invoke the JwksFunction Lambda function.
Run the JwksFunction, InvokeFunction and RevokeFunction Lambda functions locally to test through a local HTTP server host.

```
npm run dev
```

The status list mock will be available at http://localhost:3000.

Running locally also requires the example credential issuer for end-to-end journey functionality.

### Test

```bash
npm run test
```

## Deploy

This service is deployed via GitHub Actions.

Automated deployments to `build` are triggered on push to `main` after PR approval. Manual deployments to `dev` can be triggered from the GitHub Actions menu, where you can specify a branch name or commit SHA.

## Contribute

[README](../README.md)

## Further Documentation

| Document                                           | Description                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| [`docs/infrastructure.md`](docs/infrastructure.md) | Infrastructure diagram — AWS architecture, API routes, data flow |
