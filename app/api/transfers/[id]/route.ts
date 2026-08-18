import { proxyRemittanceRequest } from "../../remittance-proxy";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return proxyRemittanceRequest(`/transfers/${params.id}`, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}
