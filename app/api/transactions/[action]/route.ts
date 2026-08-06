import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const ACTIONS: Record<string, string> = {
  "view-transaction": "/viewTransaction",
  "by-staff": "/getTransactionByStaff",
  "by-ref-no": "/getRemittanceByrefno",
  "latest-by-username": "/getRemittanceByUsernamefrompartners",
};

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const path = ACTIONS[params.action];
  if (!path) {
    return NextResponse.json(
      { success: false, message: `Unknown transaction action "${params.action}".` },
      { status: 404 }
    );
  }

  const body = await request.text();
  return proxyRemittanceRequest(path, { method: "POST", body });
}
