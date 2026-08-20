import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handler } from "../../src/functions/issueHandler";
import { logger } from "../../src/logging/logger";
import { LogMessage } from "../../src/logging/LogMessage";
import * as crypto from "crypto";
import { sign } from "../../src/common/aws/kms";
import { putObject } from "../../src/common/aws/s3";
import { derToJose } from "ecdsa-sig-formatter";

jest.mock("../../src/common/aws/kms");
jest.mock("../../src/common/aws/s3");
jest.mock("crypto");
jest.mock("../../src/logging/logger", () => ({
  logger: {
    addContext: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("ecdsa-sig-formatter");

process.env.SIGNING_KEY_ID = "test-key-id";
process.env.SELF_URL = "https://test-status-list.com";
process.env.STATUS_LIST_BUCKET_NAME = "test-bucket-name";

describe("handler", () => {
  const mockEvent = {
    headers: { "content-type": "application/jwt" },
  } as unknown as APIGatewayProxyEvent;
  const mockContext = {} as Context;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, "random").mockReturnValue(0);
    jest
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("36940190-e6af-42d0-9181-74c944dc4af7");
    jest.spyOn(global.Date, "now").mockReturnValue(Date.parse("2025-08-21"));
    jest.mocked(sign).mockResolvedValue(new Uint8Array([1, 2, 3]));
    jest.mocked(derToJose).mockReturnValue("mockJoseSignature");
    jest.mocked(putObject).mockResolvedValue();
  });

  it("should return 200 response with expected body", async () => {
    const result = await handler(mockEvent, mockContext);
    expect(result).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
      body: JSON.stringify({
        idx: 0,
        uri: "https://test-status-list.com/t/36940190-e6af-42d0-9181-74c944dc4af7",
      }),
    });
    expect(sign).toHaveBeenCalledWith(
      "eyJhbGciOiJFUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIiwidHlwIjoic3RhdHVzbGlzdCtqd3QifQ.eyJpYXQiOjE3NTU3MzQ0MDAsImV4cCI6MTc1ODMyNjQwMCwiaXNzIjoiaHR0cHM6Ly90ZXN0LXN0YXR1cy1saXN0LmNvbSIsInN0YXR1c19saXN0Ijp7ImJpdHMiOjIsImxzdCI6ImVOcHpjQUVBQU1ZQWhRIn0sInN1YiI6Imh0dHBzOi8vdGVzdC1zdGF0dXMtbGlzdC5jb20vdC8zNjk0MDE5MC1lNmFmLTQyZDAtOTE4MS03NGM5NDRkYzRhZjciLCJ0dGwiOjI1OTIwMDB9",
      "test-key-id",
    );
    expect(derToJose).toHaveBeenCalledWith("AQID", "ES256");
    expect(putObject).toHaveBeenCalledWith(
      "test-bucket-name",
      "t/36940190-e6af-42d0-9181-74c944dc4af7",
      "eyJhbGciOiJFUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIiwidHlwIjoic3RhdHVzbGlzdCtqd3QifQ.eyJpYXQiOjE3NTU3MzQ0MDAsImV4cCI6MTc1ODMyNjQwMCwiaXNzIjoiaHR0cHM6Ly90ZXN0LXN0YXR1cy1saXN0LmNvbSIsInN0YXR1c19saXN0Ijp7ImJpdHMiOjIsImxzdCI6ImVOcHpjQUVBQU1ZQWhRIn0sInN1YiI6Imh0dHBzOi8vdGVzdC1zdGF0dXMtbGlzdC5jb20vdC8zNjk0MDE5MC1lNmFmLTQyZDAtOTE4MS03NGM5NDRkYzRhZjciLCJ0dGwiOjI1OTIwMDB9.mockJoseSignature",
    );
    expect(logger.addContext).toHaveBeenCalledWith(mockContext);
    expect(logger.info).toHaveBeenCalledWith(LogMessage.ISSUE_LAMBDA_STARTED);
    expect(logger.info).toHaveBeenCalledWith(LogMessage.ISSUE_LAMBDA_COMPLETED);
    expect(logger.info).toHaveBeenCalledTimes(2);
  });

  it("should return 500 when Content-Type is not application/jwt", async () => {
    const event = {
      headers: { "content-type": "application/json" },
    } as unknown as APIGatewayProxyEvent;
    const result = await handler(event, mockContext);

    expect(result).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        error_description: "Internal server error",
      }),
    });
    expect(logger.error).toHaveBeenCalledWith(
      LogMessage.ISSUE_VALIDATION_FAILED,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("should return 500 when Content-Type header is missing", async () => {
    const event = {
      headers: {},
    } as unknown as APIGatewayProxyEvent;
    const result = await handler(event, mockContext);

    expect(result).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        error_description: "Internal server error",
      }),
    });
    expect(logger.error).toHaveBeenCalledWith(
      LogMessage.ISSUE_VALIDATION_FAILED,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("should return 500 and log error when S3 upload fails", async () => {
    const s3Error = new Error("S3 upload failed");
    jest.mocked(putObject).mockRejectedValue(s3Error);
    const result = await handler(mockEvent, mockContext);
    expect(result).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        error_description: "Internal server error",
      }),
    });
    expect(logger.error).toHaveBeenCalledWith(LogMessage.ISSUE_LAMBDA_ERROR, {
      error: s3Error,
    });
  });

  it("should return 500 and log error when sign function fails", async () => {
    const signError = new Error("Signing failed");
    jest.mocked(sign).mockRejectedValue(signError);
    const result = await handler(mockEvent, mockContext);
    expect(result).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        error_description: "Internal server error",
      }),
    });
    expect(logger.error).toHaveBeenCalledWith(LogMessage.ISSUE_LAMBDA_ERROR, {
      error: signError,
    });
  });
});
