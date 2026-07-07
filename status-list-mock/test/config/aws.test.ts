import {
  getKmsConfig,
  getS3Config,
  getLocalAwsClientConfig,
} from "../../src/config/aws";

const AWS_REGION = "eu-west-2";
const LOCAL_AWS_ENDPOINT = "http://host.docker.internal:4562";
const LOCAL_KMS_ENDPOINT = "http://host.docker.internal:4563";

describe("getLocalAwsClientConfig", () => {
  it("should return Local AWS client config object", () => {
    const config = getLocalAwsClientConfig();

    expect(config).toEqual({
      endpoint: LOCAL_AWS_ENDPOINT,
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
      },
      region: AWS_REGION,
    });
  });
});

describe("getKmsConfig", () => {
  it("should return Local KMS client config object when isLocal=true", () => {
    const isLocal = true;
    const config = getKmsConfig(isLocal);

    expect(config).toEqual({
      endpoint: LOCAL_KMS_ENDPOINT,
    });
  });

  it("should return empty KMS client config object when isLocal=false", () => {
    const isLocal = false;
    const config = getKmsConfig(isLocal);

    expect(config).toEqual({});
  });
});

describe("getS3Config", () => {
  it("should return Local AWS AWS client config object with forcePathStyle when isLocal=true", () => {
    const isLocal = true;
    const config = getS3Config(isLocal);

    expect(config).toEqual({
      endpoint: LOCAL_AWS_ENDPOINT,
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
      },
      region: AWS_REGION,
      forcePathStyle: true,
    });
  });

  it("should return empty AWS client config object when isLocal=false", () => {
    const isLocal = false;
    const config = getS3Config(isLocal);

    expect(config).toEqual({});
  });
});
