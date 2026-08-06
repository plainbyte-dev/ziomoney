import { proxyRemittanceRequest } from "../../remittance-proxy";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/beneficiaries/${params.id}`, { method: "GET" });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/beneficiaries/${params.id}`, { method: "DELETE" });
}
