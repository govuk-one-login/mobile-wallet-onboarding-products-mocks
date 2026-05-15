# TxMA Mock

## Overview

Mock of the Mobile Platform `POST /txma-event` endpoint. Accepts any request body and always returns `200 OK` using [API Gateway mock integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html).

## Tech stack

API Gateway mock integration with infrastructure managed via AWS SAM.

## Prerequisites

- [rain](https://github.com/aws-cloudformation/rain) — used to format SAM templates
- [Checkov](https://www.checkov.io) — used for IaC static analysis (`brew install checkov`)

## Set up locally

The SAM template is formatted using rain. To format `template.yaml`:

```bash
rain fmt -w template.yaml
```

To run Checkov static analysis on the SAM template:

```bash
checkov --file template.yaml
```

## Deploy

This service is deployed via GitHub Actions.

Automated deployments to `build` are triggered on push to `main` after PR approval. Manual deployments to `dev` can be triggered from the GitHub Actions menu, where you can specify a branch name or commit SHA.