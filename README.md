# 🎬 TMDb Vercel API (Anime-friendly)

A simple **serverless API** hosted on Vercel that fetches **anime / movie / TV info** directly from [TMDb](https://www.themoviedb.org/).  
Designed for **anime projects**, but works for all media.

---

## 🚀 Features
- `GET /api/anime/search?query=<title>&type=tv|movie&page=1` → Search by title  
- `GET /api/anime/by-tmdb?id=<tmdb_id>&type=tv|movie` → Fetch full TMDb info  
- Includes **titles, overview, genres, episodes, runtime, status**  
- Returns **poster & backdrop thumbnails** in multiple sizes  
- Returns **external IDs (IMDB, AniList, MAL if linked)**  
- CORS enabled → ready for frontend usage  

---

## 🛠️ Setup

### 1. Deploy with one click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lvxkyispro/tmdb-detaisl&env=TMDB_API_KEY)

### 2. Or manual
```bash
git clone https://github.com/lvxkyispro/tmdb-detaisl
cd tmdb-detaisl
npm install
