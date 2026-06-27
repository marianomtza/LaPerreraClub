import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireAdminUser();
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });

  const { data, error } = await supabase.from("club_submissions").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const headers = ["nombre", "correo", "ciudad", "red", "origen", "fecha"];
  const rows = (data || []).map((row) =>
    [row.name, row.email, row.city, row.social_handle, row.discovery_source, row.created_at].map(csvCell).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="la-perrera-club.csv"'
    }
  });
}
