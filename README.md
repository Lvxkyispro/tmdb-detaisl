# TMDb Vercel API (Anime-friendly)

Endpoints:
- `GET /api/anime/by-tmdb?id=<tmdb_id>&type=tv|movie`
- `GET /api/anime/search?query=<text>&type=tv|movie&page=1`

## Env
Set `TMDB_API_KEY` in Vercel (Project → Settings → Environment Variables).

## Deploy
```bash
npm i -g vercel
vercel
