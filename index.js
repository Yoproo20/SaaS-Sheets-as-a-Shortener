const SHEET_API = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; //replace with your Google Apps Script URL


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const code = url.pathname.slice(1);

    if (!code) {
      return new Response("Enter a short link slug.", { status: 200 });
    }

    // Cloudflare KV first
    const cachedLink = await env.urlShortner.get(code);
    if (cachedLink) {
      return Response.redirect(cachedLink, 301);
    }

    // 3. Not in KV? Fetch from Google Sheets
    try {
      const res = await fetch(SHEET_API);
      if (!res.ok) throw new Error("Sheets API unavailable");
      
      const links = await res.json();
      const longUrl = links[code];

      if (longUrl) {
        ctx.waitUntil(env.urlShortner.put(code, longUrl, { expirationTtl: 86400 })); 

        return Response.redirect(longUrl, 301);
      }
    } catch (err) {
      console.error("Error fetching from Sheets:", err);
    }

    return new Response("Short link not found", { status: 404 });
  }
};
