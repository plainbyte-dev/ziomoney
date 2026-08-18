import { proxyRemittanceRequest } from "../../../remittance-proxy";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/transfers/${params.id}/cancel`, {
    method: "PUT",
    authorization: request.headers.get("authorization"),
  });
}
