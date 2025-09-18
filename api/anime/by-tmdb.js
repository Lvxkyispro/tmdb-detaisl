// api/anime/by-tmdb.js
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = (path, size = "w500") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

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

  const id = req.query.id || req.query.tmdb_id;
  const type = (req.query.type || "tv").toLowerCase(); // anime is usually TV; use ?type=movie for films

  if (!id) return res.status(400).json({ error: "Missing id (tmdb_id)" });
  if (!["tv", "movie"].includes(type)) return res.status(400).json({ error: "type must be tv or movie" });

  const url = new URL(`${TMDB_BASE}/${type}/${id}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("append_to_response", "credits,images,external_ids");

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);

    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);

    if (r.status === 404) return res.status(404).json({ matched: false, message: "TMDb not found" });
    if (!r.ok) return res.status(502).json({ error: "TMDb error", status: r.status, detail: await r.text() });

    const data = await r.json();

    // Normalize some handy fields
    const poster_path = data.poster_path || null;
    const backdrop_path = data.backdrop_path || null;

    const common = {
      id: data.id,
      type,
      title:
        type === "movie"
          ? data.title || data.original_title
          : data.name || data.original_name,
      original_title: type === "movie" ? data.original_title : data.original_name,
      overview: data.overview || "",
      year:
        type === "movie"
          ? (data.release_date || "").slice(0, 4) || null
          : (data.first_air_date || "").slice(0, 4) || null,
      genres: (data.genres || []).map((g) => g.name),
      poster: {
        w185: IMG(poster_path, "w185"),
        w342: IMG(poster_path, "w342"),
        w500: IMG(poster_path, "w500"),
        original: IMG(poster_path, "original")
      },
      backdrop: {
        w300: IMG(backdrop_path, "w300"),
        w780: IMG(backdrop_path, "w780"),
        w1280: IMG(backdrop_path, "w1280"),
        original: IMG(backdrop_path, "original")
      },
      external_ids: data.external_ids || {},
      credits: data.credits || {}
    };

    if (type === "tv") {
      common.episodes = data.number_of_episodes ?? null;
      common.seasons = data.number_of_seasons ?? null;
      common.status = data.status ?? null;
      common.networks = (data.networks || []).map((n) => n.name);
    } else {
      common.runtime = data.runtime ?? null;
      common.status = data.status ?? null;
    }

    return res.status(200).json({
      matched: true,
      tmdb: common,
      raw: data // keep full original for power users
    });
  } catch (e) {
    const msg = e?.name === "AbortError" ? "TMDb timeout" : (e?.message || "Fetch failed");
    return res.status(502).json({ error: msg });
  }
}
