import { list } from "@vercel/blob";

export async function GET(request) {
  try {
    const { blobs } = await list({ prefix: "qris-current" });

    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": blobs[0].contentType || "image/png",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (e) {
    // fall through to placeholder
  }

  const placeholderUrl = new URL("/qris-placeholder.svg", request.url);
  return Response.redirect(placeholderUrl, 302);
}
