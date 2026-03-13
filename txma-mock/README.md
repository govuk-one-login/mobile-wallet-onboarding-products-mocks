# TxMA Event Mock

A mock of the Mobile Platform `POST /txma-event` endpoint. Built using API Gateway's mock integration, it accepts any request body and always returns `200 OK`.

## Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Deploying to Dev

> You must be logged into the Onboarding Products `dev` AWS account.

Deploy a custom stack to the `dev` account with:

```bash
sam build && sam deploy --guided
```