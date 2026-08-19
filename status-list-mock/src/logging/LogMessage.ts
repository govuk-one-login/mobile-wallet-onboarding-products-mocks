import { LogAttributes } from "@aws-lambda-powertools/logger/types";

export class LogMessage implements LogAttributes {
  static readonly ISSUE_LAMBDA_STARTED = new LogMessage(
    "ISSUE_LAMBDA_STARTED",
    "Issue Lambda handler processing has started.",
    "N/A",
  );

  static readonly ISSUE_LAMBDA_COMPLETED = new LogMessage(
    "ISSUE_LAMBDA_COMPLETED",
    "Issue Lambda handler processing has completed.",
    "N/A",
  );

  static readonly ISSUE_VALIDATION_FAILED = new LogMessage(
    "ISSUE_VALIDATION_FAILED",
    "Issue request validation failed.",
    "N/A",
  );

  static readonly ISSUE_LAMBDA_ERROR = new LogMessage(
    "ISSUE_LAMBDA_ERROR",
    "Issue Lambda handler encountered an error.",
    "N/A",
  );

  static readonly REVOKE_LAMBDA_STARTED = new LogMessage(
    "REVOKE_LAMBDA_STARTED",
    "Revoke Lambda handler processing has started.",
    "N/A",
  );

  static readonly REVOKE_LAMBDA_COMPLETED = new LogMessage(
    "REVOKE_LAMBDA_COMPLETED",
    "Revoke Lambda handler processing has completed.",
    "N/A",
  );

  static readonly REVOKE_VALIDATION_FAILED = new LogMessage(
    "REVOKE_VALIDATION_FAILED",
    "Revoke request validation failed.",
    "N/A",
  );

  static readonly REVOKE_LAMBDA_ERROR = new LogMessage(
    "REVOKE_LAMBDA_ERROR",
    "Revoke Lambda handler encountered an error.",
    "N/A",
  );

  static readonly JWKS_LAMBDA_STARTED = new LogMessage(
    "JWKS_LAMBDA_STARTED",
    "JWKS Lambda handler processing has started.",
    "N/A",
  );

  static readonly JWKS_LAMBDA_COMPLETED = new LogMessage(
    "JWKS_LAMBDA_COMPLETED",
    "JWKS Lambda handler processing has completed.",
    "N/A",
  );

  static readonly JWKS_LAMBDA_ERROR = new LogMessage(
    "JWKS_LAMBDA_ERROR",
    "JWKS Lambda handler encountered an error.",
    "N/A",
  );

  private constructor(
    public readonly messageCode: string,
    public readonly message: string,
    public readonly userImpact: string,
  ) {}

  [key: string]: string | LogMessage;
}
