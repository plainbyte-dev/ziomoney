import { proxyAuthRequest } from "../proxy";

export async function POST(request: Request) {
  return proxyAuthRequest("/api/auth/login", { method: "POST", body: await request.text() });
}
