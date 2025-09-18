// api/anime/search.js
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = (path, size = "w185") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

const okCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export default async function handler(req, res) {
  okCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "TMDB_API_KEY not set" });

  const query = (req.query.query || "").trim();
  const type = (req.query.type || "tv").toLowerCase();
  const page = parseInt(req.query.page || "1", 10);

  if (!query) return res.status(400).json({ error: "Missing query" });
  if (!["tv", "movie"].includes(type)) return res.status(400).json({ error: "type must be tv or movie" });

  const url = new URL(`${TMDB_BASE}/search/${type}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("include_adult", "false");

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);

    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);

    if (!r.ok) return res.status(502).json({ error: "TMDb error", status: r.status, detail: await r.text() });
    const data = await r.json();

    const results = (data.results || []).map((it) => ({
      id: it.id,
      type,
      title: type === "movie" ? it.title || it.original_title : it.name || it.original_name,
      year: type === "movie"
        ? (it.release_date || "").slice(0, 4) || null
        : (it.first_air_date || "").slice(0, 4) || null,
      overview: it.overview || "",
      poster: {
        w185: IMG(it.poster_path, "w185"),
        w342: IMG(it.poster_path, "w342")
      },
      backdrop: {
        w300: IMG(it.backdrop_path, "w300"),
        w780: IMG(it.backdrop_path, "w780")
      },
      popularity: it.popularity,
      vote_average: it.vote_average,
      vote_count: it.vote_count
    }));

    return res.status(200).json({
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results
    });
  } catch (e) {
    const msg = e?.name === "AbortError" ? "TMDb timeout" : (e?.message || "Fetch failed");
    return res.status(502).json({ error: msg });
  }
}
