# Mobile Wallet Onboarding Products Mocks

Code repository for mocks maintained by Wallet Onboarding Products.

## Mocks

- [STS Mock](./sts-mock/README.md)
- [TxMA Mock](./txma-mock/README.md)

## Template Utilities

[`sam-template-utils.sh`](./sam-template-utils.sh) provides utilities for working with SAM templates across the project.

### Prerequisites

- [rain](https://github.com/aws-cloudformation/rain)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

### Usage

Format all templates:

```bash
./sam-template-utils.sh rain_format
```

Validate all templates:

```bash
./sam-template-utils.sh sam_validate
```
