import { proxyRemittanceRequest } from "../remittance-proxy";

const UPSTREAM_PATH = "/transfers";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyRemittanceRequest(`${UPSTREAM_PATH}${search}`, {
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
