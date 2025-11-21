const SHEET_API = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; //replace with your Google Apps Script URL

let cache = null;
let cacheTime = 0;

const CACHE_TTL = 60 * 1000; 


async function loadData() {
  try {
    const res = await fetch(SHEET_API);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load Google Sheets data:", err);
    return {};
  }
}


function isCacheExpired() {
  return Date.now() - cacheTime > CACHE_TTL;
}


async function getLinks(forceReload = false) {
  if (!cache || isCacheExpired() || forceReload) {
    cache = await loadData();
    cacheTime = Date.now();
  }
  return cache;
}


export default {
  async fetch(request) {
    const url = new URL(request.url);
    const code = url.pathname.slice(1);


    let links = await getLinks();


    if (!links[code]) {
      links = await getLinks(true);
    }


    if (links[code]) {
      return Response.redirect(links[code], 301);
    }


    return new Response("Short link not found", { status: 404 });
  }
};
