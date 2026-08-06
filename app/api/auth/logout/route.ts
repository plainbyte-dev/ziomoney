import { proxyAuthRequest } from "../proxy";

export async function POST(request: Request) {
  return proxyAuthRequest("/api/auth/logout", {
    method: "POST",
    authorization: request.headers.get("authorization"),
  });
}
