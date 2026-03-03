# STS Mock

A mock of STS (Security Token Service) built using [Imposter](https://www.imposter.sh). The mock server is generated from the OpenAPI specs defined in sts.yaml and healthcheck.yaml.


## Prerequisites

- [Docker](https://www.docker.com)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Running Locally

Build the Docker image:

```bash
docker build -t sts-mock .
```

Run the container:

```bash
docker run -p 9090:8080 sts-mock
```

## Deploying to Dev

> You must be logged into the Onboarding Products `dev` AWS account.

To deploy a custom stack to the `dev` account, build and push the STS mock Docker image to ECR:

```bash
./build-and-deploy-image.sh <image-tag> <aws-profile>
```

Then deploy the stack:

```bash
sam build && sam deploy --guided
```
