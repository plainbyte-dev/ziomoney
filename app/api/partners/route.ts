import { proxyRemittanceRequest } from "../remittance-proxy";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyRemittanceRequest("/insertRemittancePartner", { method: "POST", body });
}
