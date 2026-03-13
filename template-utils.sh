#!/bin/bash
set -eu

rain_format() {
  TEMPLATES="$(find . -name template.yaml -not -path '*/.aws-sam/*')"
  for i in $TEMPLATES; do
    rain fmt -w "$i"
  done
}

sam_validate() {
  TEMPLATES="$(find . -name template.yaml -not -path '*/.aws-sam/*')"
  for i in $TEMPLATES; do
    sam validate --template "$i" --lint
  done
}

"$@"
