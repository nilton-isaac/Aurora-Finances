import { NextResponse } from "next/server";

import { checkFinanceDatabaseConnection } from "@/lib/finance-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkFinanceDatabaseConnection();

    return NextResponse.json(result, {
      status: result.ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          error instanceof Error ? error.message : "Falha ao validar conexão."
      },
      {
        status: 500
      }
    );
  }
}
