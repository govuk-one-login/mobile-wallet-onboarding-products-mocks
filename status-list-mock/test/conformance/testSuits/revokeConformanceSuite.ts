import { ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { expectStatus } from "../helpers/expectStatus";
import { waitForPort } from "../helpers/waitForPort";

const PRISM_PORT = 4010;
const PRISM_BASE_URL = `http://127.0.0.1:${PRISM_PORT}`;

const prismBin = path.resolve(process.cwd(), "node_modules/.bin/prism");
const apiSpec = path.resolve(
  process.cwd(),
  "openApiSpec/crs/crs-status-api.yaml",
);

export interface SuiteConfig {
  upstream: string;
  beforeAllTimeout: number;
  setup: () => Promise<void>;
  /** Base URL used in the JWT `uri` claim. Must match the service's SELF_URL.
   *  Defaults to `upstream` when not provided (works for deployed environments). */
  selfUrl?: string;
}

/**
 * Builds a minimal unsigned JWT for the revoke endpoint.
 * The `uri` claim uses the provided base URL so it passes the SELF_URL validation.
 */
function buildRevokeJwt(baseUrl: string): string {
  const header = { alg: "ES256", typ: "JWT" };
  const payload = {
    iss: "gov.uk",
    iat: 1756457120,
    exp: 1787993120,
    idx: 0,
    uri: `${baseUrl}/t/36940190-e6af-42d0-9181-74c944dc4af7`,
  };

  const encode = (obj: object): string =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  return `${encode(header)}.${encode(payload)}.test-signature`;
}

async function postToRevoke(
  body: string,
  contentType?: string,
): Promise<Response> {
  return fetch(`${PRISM_BASE_URL}/revoke`, {
    method: "POST",
    headers: contentType ? { "Content-Type": contentType } : {},
    body,
  });
}

export function revokeConformanceSuite(config: SuiteConfig): void {
  describe("POST /revoke — Prism proxy conformance", () => {
    let prism: ChildProcess;

    beforeAll(async () => {
      await config.setup();

      prism = spawn(
        prismBin,
        [
          "proxy",
          apiSpec,
          config.upstream,
          "--errors",
          "--port",
          String(PRISM_PORT),
        ],
        { stdio: "pipe" },
      );

      await waitForPort(PRISM_PORT);
    }, config.beforeAllTimeout);

    afterAll(() => {
      prism?.kill();
    });

    it("proxies a valid request and gets a valid response", async () => {
      const revokeJwt = buildRevokeJwt(config.selfUrl ?? config.upstream);
      const res = await postToRevoke(revokeJwt, "application/jwt");

      await expectStatus(res.clone(), 202);
      const body = await res.json();
      expect(body.message).toBe("Request processed for revocation");
      expect(typeof body.revokedAt).toBe("number");
      expect(body.revokedAt).toBeGreaterThanOrEqual(0);
    });
  });
}
