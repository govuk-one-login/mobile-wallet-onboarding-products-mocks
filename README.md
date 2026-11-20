# Mobile Wallet Onboarding Products Mocks

## Project structure

Code repository for mocks maintained by Wallet Onboarding Products. This project contains the following modules:

* [`sts-mock`](./sts-mock/) - A mock of STS (Security Token Service), built using Imposter and deployed to ECS Fargate.
* [`txma-mock`](./txma-mock/) - A mock of the Mobile Platform `POST /txma-event` endpoint, built using API Gateway's mock integration.
* [`status-list-mock`](./status-list-mock/) - A mock implementation of the Status List service used by GOV.UK Wallet to check the current status of its stored credentials.

## GitHub Actions workflows

The pre-merge, post-merge and dev deploy workflows cover all three mocks and are built from reusable modules (`_reusable-*.yml`) in `.github/workflows`:

* `pull-request-checks.yml` - pre-merge checks.
* `push-to-main.yml` - post-merge checks and upload to the build environment.
* `dev-deploy.yml` - manual deploy to dev (choose a service or `all`, plus a git ref).

Each workflow starts with a `detect-services` job, which selects the services to act on from the changed files (or the `service` input on manual runs). Per-service settings (directory, secret prefix, SAM version, whether it has a Node.js project or container image, and so on) live in `.github/config/services.json`. Secrets are resolved by name as `<ENVIRONMENT>_<SECRET-PREFIX>_<SUFFIX>`, for example `BUILD_STS_MOCK_GH_ACTIONS_ROLE_ARN`.

To add a new mock, add an entry to `services.json`, add its path to the `paths` filters and the `service` choice options in the three workflows, and create the matching secrets.

## Contributing

This project uses [pre-commit](https://pre-commit.com/) to enforce code quality and validate commit messages against [Conventional Commits](https://github.com/conventional-changelog/commitlint) standards across all projects in this repository. Non-conforming messages will be rejected.

Ensure your branch is up to date and all hooks pass before opening a pull request. Avoid using the git `--no-verify` flag to skip these checks unless absolutely necessary.

### Installation

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
