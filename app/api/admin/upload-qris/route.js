import { cookies } from "next/headers";
import { getExpectedToken } from "@/lib/auth";
import { put, list, del } from "@vercel/blob";

function isAuthed() {
  const session = cookies().get("admin_session");
  return session?.value === getExpectedToken();
}

const EXT_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

export async function POST(request) {
  if (!isAuthed()) {
    return Response.json({ error: "Belum login" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const ext = EXT_MAP[file.type] || "png";

    // Hapus QRIS lama biar storage nggak numpuk
    const { blobs } = await list({ prefix: "qris-current" });
    await Promise.all(blobs.map((b) => del(b.url)));

    const blob = await put(`qris-current.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });

    return Response.json({ success: true, url: blob.url });
  } catch (e) {
    return Response.json({ error: "Gagal upload: " + e.message }, { status: 500 });
  }
}
