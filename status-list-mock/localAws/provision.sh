#!/bin/sh

set -e

ENDPOINT=http://localhost:4566
REGION=eu-west-2

aws --endpoint-url=${ENDPOINT} s3api create-bucket --bucket jwks --create-bucket-configuration LocationConstraint=${REGION}

aws --endpoint-url=${ENDPOINT} s3api create-bucket --bucket status-list --create-bucket-configuration LocationConstraint=${REGION}
