import { getHeaderValueFromHeaders } from "../../src/common/getHeaderValueFromHeaders";

describe("getHeaderValueFromHeaders", () => {
  it("should return the header value for a lowercase key match", () => {
    const headers = { "content-type": "application/jwt" };
    expect(getHeaderValueFromHeaders(headers, "content-type")).toBe(
      "application/jwt",
    );
  });

  it("should return the header value for a Pascal-case key match", () => {
    const headers = { "Content-Type": "application/jwt" };
    expect(getHeaderValueFromHeaders(headers, "content-type")).toBe(
      "application/jwt",
    );
  });

  it("should return the header value regardless of search casing", () => {
    const headers = { "content-type": "application/jwt" };
    expect(getHeaderValueFromHeaders(headers, "Content-Type")).toBe(
      "application/jwt",
    );
  });

  it("should return undefined when the header is not present", () => {
    const headers = { "x-custom-header": "value" };
    expect(getHeaderValueFromHeaders(headers, "content-type")).toBeUndefined();
  });

  it("should return undefined when headers is null", () => {
    expect(
      getHeaderValueFromHeaders(
        null as unknown as Record<string, string>,
        "content-type",
      ),
    ).toBeUndefined();
  });

  it("should return undefined when headers is undefined", () => {
    expect(
      getHeaderValueFromHeaders(
        undefined as unknown as Record<string, string>,
        "content-type",
      ),
    ).toBeUndefined();
  });

  it("should return undefined when headers is an empty object", () => {
    expect(getHeaderValueFromHeaders({}, "content-type")).toBeUndefined();
  });

  it("should return the first match when multiple casings exist", () => {
    const headers = {
      "Content-Type": "application/json",
      "content-type": "application/jwt",
    };
    const result = getHeaderValueFromHeaders(headers, "content-type");
    expect(result).toBeDefined();
    expect(["application/json", "application/jwt"]).toContain(result);
  });
});
