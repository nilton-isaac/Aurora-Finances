import { NextResponse } from "next/server";

import { loadFinanceState, saveFinanceState } from "@/lib/finance-store";
import { isFinanceData } from "@/lib/finance-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const state = await loadFinanceState();

    if (!state) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL/DIRECT_URL não configuradas. A aplicação segue disponível em modo local."
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha ao carregar dados do banco."
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!isFinanceData(body?.data)) {
      return NextResponse.json(
        {
          error: "Payload inválido para persistência financeira."
        },
        {
          status: 400
        }
      );
    }

    const saved = await saveFinanceState(body.data);

    return NextResponse.json(
      {
        data: saved.data,
        updatedAt: saved.updatedAt
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha ao salvar dados no banco."
      },
      {
        status: 500
      }
    );
  }
}
