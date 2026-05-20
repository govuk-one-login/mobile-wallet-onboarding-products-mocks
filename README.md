# Mobile Wallet Onboarding Products Mocks

## Project structure

Code repository for mocks maintained by Wallet Onboarding Products. This project contains two modules:

* [`sts-mock`](./sts-mock/) - A mock of STS (Security Token Service), built using Imposter and deployed to ECS Fargate.
* [`txma-mock`](./txma-mock/) - A mock of the Mobile Platform `POST /txma-event` endpoint, built using API Gateway's mock integration.

## Contributing

This project uses [pre-commit](https://pre-commit.com/) to enforce code quality and validate commit messages against [Conventional Commits](https://github.com/conventional-changelog/commitlint) standards across all projects in this repository. Non-conforming messages will be rejected.

Ensure your branch is up to date and all hooks pass before opening a pull request. Avoid using the git `--no-verify` flag to skip these checks unless absolutely necessary.

### Installation

```bash
brew install rain
```

```bash
brew install pre-commit
```

```bash
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit install --hook-type pre-push
```

## Getting Started

See the README in each module directory for further information.
