# STS Mock

## Overview

Mock of STS (Security Token Service) built using [Imposter](https://www.imposter.sh). The mock server is generated from the OpenAPI specs defined in `sts.yaml` and `healthcheck.yaml`.

Most endpoints serve responses directly from the examples defined in `sts.yaml`. The exception is `POST /token`, whose response is handled by `token.groovy`. The script inspects the `grant_type` in the request body and returns the appropriate spec example response for each flow (`authorization_code`, `token-exchange`, `refresh_token`). For the `pre-authorized_code` flow, it builds a dynamic access token.

## Tech stack

Imposter for OpenAPI-based mocking, Docker for containerisation, deployed to AWS ECS Fargate behind API Gateway, with infrastructure managed via AWS SAM.

## Prerequisites

- [Docker](https://www.docker.com)
- [Pre-commit](https://pre-commit.com/) — see [root README](../README.md) for setup

## Set up locally

### Running checks manually

```bash
pre-commit run checkov --files sts-mock/template.yaml
pre-commit run rain-format --files sts-mock/template.yaml
pre-commit run cfn-lint-rc --files sts-mock/template.yaml
```

### Run

Build the Docker image:

```bash
docker build -t sts-mock .
```

Run the container:

```bash
docker run -p 9090:8080 sts-mock
```

To run with environment variable overrides, copy `.env.example` to `.env`, edit as needed, then:

```bash
docker run -p 9090:8080 --env-file .env sts-mock
```

## Deploy

This service is deployed via GitHub Actions.

Automated deployments to `build` are triggered on push to `main` after PR approval. Manual deployments to `dev` can be triggered from the GitHub Actions menu, where you can specify a branch name or commit SHA.

## CI checks

### OpenAPI spec sync

The `sts-mock-check-oas-for-drift` workflow ensures the OpenAPI spec in this repo stays in sync with `sts-back`.

It clones `sts-back` and uses [oasdiff](https://github.com/oasdiff/oasdiff) to compare the specs. If differences are found, the workflow fails and a notification is sent to the OP Slack channel.

When this happens, update `sts.yaml` to reflect the upstream changes.
