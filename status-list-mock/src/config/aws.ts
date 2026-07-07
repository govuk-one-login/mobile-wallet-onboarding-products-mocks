import { KMSClientConfig } from "@aws-sdk/client-kms";
import { S3ClientConfig } from "@aws-sdk/client-s3";

type AwsBaseClientConfig = {
  endpoint: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
  region: string;
};

export function getLocalAwsClientConfig(): AwsBaseClientConfig {
  return {
    endpoint: "http://host.docker.internal:4562", // NOSONAR: This endpoint is for internal Docker host
    // communication within a local environment. HTTPS is not supported for 'host.docker.internal' and
    // the communication is not exposed externally, hence using HTTP instead of HTTPS is acceptable.
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    region: "eu-west-2",
  };
}

export function getKmsConfig(isLocal: boolean): KMSClientConfig {
  if (isLocal) {
    return { endpoint: "http://host.docker.internal:4563" };
  }

  return {};
}

export function getS3Config(isLocal: boolean): S3ClientConfig {
  if (isLocal) {
    return {
      ...getLocalAwsClientConfig(),
      forcePathStyle: true,
    };
  }

  return {};
}
