import crypto from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdminUser } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdminUser();
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Selecciona un archivo." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Formato no permitido." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "El archivo supera 8 MB." }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const inputHash = crypto.createHash("sha256").update(input).digest("hex");
  const existing = await supabase.from("media_assets").select("*").eq("hash", inputHash).maybeSingle();
  if (existing.data) return NextResponse.json({ asset: existing.data });

  const optimized = await sharp(input)
    .rotate()
    .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const hash = crypto.createHash("sha256").update(optimized.data).digest("hex");
  const storagePath = `uploads/${hash}.webp`;

  const upload = await supabase.storage.from("media").upload(storagePath, optimized.data, {
    contentType: "image/webp",
    upsert: false
  });

  if (upload.error && upload.error.message !== "The resource already exists") {
    return NextResponse.json({ message: upload.error.message }, { status: 500 });
  }

  const publicUrl = supabase.storage.from("media").getPublicUrl(storagePath).data.publicUrl;
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      path: storagePath,
      original_filename: file.name,
      alt_text: altText,
      mime_type: "image/webp",
      width: optimized.info.width,
      height: optimized.info.height,
      size_bytes: optimized.info.size,
      hash,
      public_url: publicUrl
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ asset: data });
}
