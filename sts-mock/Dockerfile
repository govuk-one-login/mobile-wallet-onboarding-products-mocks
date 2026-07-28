FROM outofcoffee/imposter:latest
COPY sts.yaml healthcheck.yaml sts-imposter-config.yaml healthcheck-imposter-config.yaml token.groovy /opt/imposter/config/

# Run as non-root. UID 65534 is the 'nobody' user.
# The base image is distroless (no shell), so adduser/addgroup cannot be used.
USER 65534
