import { proxyRemittanceRequest } from "../remittance-proxy";

const UPSTREAM_PATH = "/beneficiaries";

export async function GET(request: Request) {
  return proxyRemittanceRequest(UPSTREAM_PATH, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyRemittanceRequest(UPSTREAM_PATH, {
    method: "POST",
    body,
    authorization: request.headers.get("authorization"),
  });
}
