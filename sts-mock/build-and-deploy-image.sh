#!/bin/bash

set -eu

show_usage() {
	cat <<EOF
Usage: $0 <image-tag> <aws-profile>

Required arguments:
  image-tag    Tag for the Docker image to build and push
  aws-profile  AWS profile for the Onboarding Products dev account
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
	show_usage
	exit 0
fi

if [[ $# -ge 2 ]]; then
	TAG="$1"
	AWS_PROFILE="$2"
	ECR_REGISTRY="219494607463.dkr.ecr.eu-west-2.amazonaws.com"
	echo "Building Docker image with tag \"$TAG\""
	DOCKER_IMAGE_PATH="$ECR_REGISTRY/sts-mock-image-repo-containerrepository-ctjqse5shnuf:$TAG"
	docker build -t "$DOCKER_IMAGE_PATH" --platform linux/amd64 .

	echo "Logging into ECR"
	aws ecr get-login-password --region eu-west-2 --profile "$AWS_PROFILE" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

	echo "Pushing image to ECR"
	docker push "$DOCKER_IMAGE_PATH"

	if grep -q "CONTAINER-IMAGE-PLACEHOLDER" template.yaml; then
		echo "Updating SAM template with new image reference"
		sed -i "" "s|CONTAINER-IMAGE-PLACEHOLDER|$DOCKER_IMAGE_PATH|" template.yaml
	else
		echo "WARNING: CONTAINER-IMAGE-PLACEHOLDER not found in template.yaml - image reference not updated, stack may deploy with a stale image"
	fi

	echo "Done. Run: sam build && sam deploy --guided"
else
	show_usage
fi
