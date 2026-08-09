import { proxyRemittanceRequest } from "../../remittance-proxy";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/beneficiaries/${params.id}`, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/beneficiaries/${params.id}`, {
    method: "DELETE",
    authorization: request.headers.get("authorization"),
  });
}
