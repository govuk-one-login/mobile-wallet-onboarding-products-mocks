FROM outofcoffee/imposter:4.9.3@sha256:ff25c8708944ec81a1992cd33433bbd032f12d64ded32ec1e6825810a5f2d5cb
COPY sts.yaml healthcheck.yaml sts-imposter-config.yaml healthcheck-imposter-config.yaml token.groovy /opt/imposter/config/

# Run as non-root. UID 65534 is the 'nobody' user.
# The base image is distroless (no shell), so adduser/addgroup cannot be used.
USER 65534
