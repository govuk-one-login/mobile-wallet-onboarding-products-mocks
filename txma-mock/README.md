# TxMA Mock

## Overview

Mock of the Mobile Platform `POST /txma-event` endpoint. Accepts any request body and always returns `200 OK` using [API Gateway mock integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html).

## Tech stack

API Gateway mock integration with infrastructure managed via AWS SAM.

## Prerequisites

- [Pre-commit](https://pre-commit.com/) — see [root README](../README.md) for setup

## Set up locally

### Running checks manually

```bash
pre-commit run checkov --files txma-mock/template.yaml
pre-commit run rain-format --files txma-mock/template.yaml
pre-commit run cfn-lint-rc --files txma-mock/template.yaml
```

## Deploy

This service is deployed via GitHub Actions.

Automated deployments to `build` are triggered on push to `main` after PR approval. Manual deployments to `dev` can be triggered from the GitHub Actions menu, where you can specify a branch name or commit SHA.
