import { proxyAuthRequest } from "../../proxy";

export async function POST(request: Request) {
  return proxyAuthRequest("/api/auth/otp/verify", {
    method: "POST",
    body: await request.text(),
  });
}
