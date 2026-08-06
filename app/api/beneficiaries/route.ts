import { proxyRemittanceRequest } from "../remittance-proxy";

const UPSTREAM_PATH = "/beneficiaries";

export async function GET() {
  return proxyRemittanceRequest(UPSTREAM_PATH, { method: "GET" });
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyRemittanceRequest(UPSTREAM_PATH, { method: "POST", body });
}
