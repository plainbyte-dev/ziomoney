import { proxyRemittanceRequest } from "../../../remittance-proxy";

export async function GET(request: Request, { params }: { params: { referenceNumber: string } }) {
  return proxyRemittanceRequest(`/transfers/ref/${params.referenceNumber}`, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}
