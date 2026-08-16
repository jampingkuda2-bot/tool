export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Link TikTok tidak ada" }, { status: 400 });
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    const json = await res.json();

    if (json.code !== 0 || !json.data) {
      return Response.json(
        { error: json.msg || "Gagal ambil data video. Pastikan link valid & video publik." },
        { status: 400 }
      );
    }

    return Response.json({ success: true, data: json.data });
  } catch (e) {
    return Response.json({ error: "Terjadi kesalahan: " + e.message }, { status: 500 });
  }
}
