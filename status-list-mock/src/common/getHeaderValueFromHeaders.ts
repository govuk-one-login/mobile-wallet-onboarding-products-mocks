import { APIGatewayProxyEventHeaders } from "aws-lambda";

export function getHeaderValueFromHeaders(
  headers: APIGatewayProxyEventHeaders,
  headerName: string,
): string | undefined {
  const header = Object.entries(headers || {}).find(
    ([k, _]) => k.toLowerCase() === headerName.toLowerCase(),
  );

  return header?.[1];
}
