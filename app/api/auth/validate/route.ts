import { proxyAuthRequest } from "../proxy";

export async function GET(request: Request) {
  return proxyAuthRequest("/api/auth/validate", {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}
