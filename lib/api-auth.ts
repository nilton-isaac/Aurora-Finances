import "server-only";

import { getSupabaseServerAuthClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization.replace("Bearer ", "").trim();
  const supabase = getSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e uma chave publica do Supabase sao obrigatorias para autenticacao."
    );
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user.id;
}
