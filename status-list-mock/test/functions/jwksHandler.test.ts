import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handler } from "../../src/functions/jwksHandler";
import { logger } from "../../src/logging/logger";
import { LogMessage } from "../../src/logging/LogMessage";
import { getConfig } from "../../src/config/getConfig";
import { putObject } from "../../src/common/aws/s3";
import { getPublicKey } from "../../src/common/aws/kms";

jest.mock("../../src/config/getConfig");
jest.mock("../../src/common/aws/kms");
jest.mock("../../src/common/aws/s3");
jest.mock("../../src/logging/logger", () => ({
  logger: {
    addContext: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("crypto", () => {
  const actualCrypto = jest.requireActual("crypto");
  return {
    ...actualCrypto,
    default: actualCrypto,
    createPublicKey: jest.fn(() => ({
      export: jest.fn(() => ({
        kty: "EC",
        crv: "P-256",
        x: "xxx",
        y: "yyy",
      })),
    })),
  };
});

describe("handler", () => {
  const event = {} as APIGatewayProxyEvent;
  const context = {} as Context;
  const mockConfig = {
    SIGNING_KEY_ID: "test-key-id",
    JWKS_BUCKET_NAME: "test-jwks-bucket-name",
  };
  const mockSpki = new Uint8Array([1, 2, 3]);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getConfig).mockReturnValue(mockConfig as any);
    jest.mocked(getPublicKey).mockResolvedValue(mockSpki);
    jest.mocked(putObject).mockResolvedValue(undefined);
  });

  it("should upload JWKS", async () => {
    await handler(event, context);

    expect(logger.addContext).toHaveBeenCalledWith(context);
    expect(logger.info).toHaveBeenCalledWith(LogMessage.JWKS_LAMBDA_STARTED);
    expect(logger.info).toHaveBeenCalledWith(LogMessage.JWKS_LAMBDA_COMPLETED);
    expect(getConfig).toHaveBeenCalledWith(process.env, [
      "SIGNING_KEY_ID",
      "JWKS_BUCKET_NAME",
    ]);
    expect(getPublicKey).toHaveBeenCalledWith(mockConfig.SIGNING_KEY_ID);
    expect(putObject).toHaveBeenCalledWith(
      mockConfig.JWKS_BUCKET_NAME,
      ".well-known/jwks.json",
      '{"keys":[{"kty":"EC","crv":"P-256","x":"xxx","y":"yyy","use":"sig","kid":"test-key-id","alg":"ES256"}]}',
    );
  });

  it("should log error and not throw when getConfig fails", async () => {
    const configError = new Error("Missing env var");
    jest.mocked(getConfig).mockImplementation(() => {
      throw configError;
    });

    await handler(event, context);

    expect(logger.error).toHaveBeenCalledWith(LogMessage.JWKS_LAMBDA_ERROR, {
      error: configError,
    });
  });

  it("should log error and not throw when getPublicKey fails", async () => {
    const kmsError = new Error("KMS error");
    jest.mocked(getPublicKey).mockRejectedValue(kmsError);

    await handler(event, context);

    expect(logger.error).toHaveBeenCalledWith(LogMessage.JWKS_LAMBDA_ERROR, {
      error: kmsError,
    });
  });

  it("should log error and not throw when putObject fails", async () => {
    const s3Error = new Error("S3 error");
    jest.mocked(putObject).mockRejectedValue(s3Error);

    await handler(event, context);

    expect(logger.error).toHaveBeenCalledWith(LogMessage.JWKS_LAMBDA_ERROR, {
      error: s3Error,
    });
  });
});
