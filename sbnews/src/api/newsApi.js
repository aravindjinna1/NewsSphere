import axios from 'axios'

// Frontend-only project — no backend. Calls newsdata.io directly from the
// browser using the API key below.
const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_39decd9528564443b04768e58b952816'
const BASE_URL = 'https://newsdata.io/api/1'

const client = axios.create({
  baseURL: BASE_URL,
  params: { apikey: API_KEY, language: 'en' }
})

// Full country names, shown in the country switcher.
export const COUNTRIES = [
  { code: 'us', label: 'United States', flag: '🇺🇸' },
  { code: 'in', label: 'India', flag: '🇮🇳' },
  { code: 'gb', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'au', label: 'Australia', flag: '🇦🇺' },
  { code: 'ca', label: 'Canada', flag: '🇨🇦' },
  { code: 'de', label: 'Germany', flag: '🇩🇪' },
  { code: 'fr', label: 'France', flag: '🇫🇷' },
  { code: 'jp', label: 'Japan', flag: '🇯🇵' },
  { code: 'br', label: 'Brazil', flag: '🇧🇷' },
  { code: 'it', label: 'Italy', flag: '🇮🇹' }
]

// UI-facing category slugs stay the same as before so routes / nav / footer
// don't need to change. "general" maps to newsdata's "top" category below.
export const CATEGORIES = [
  'general', 'business', 'technology', 'science', 'health', 'sports', 'entertainment'
]
const toNewsdataCategory = (cat) => (cat === 'general' || !cat ? 'top' : cat)

/* -------------------------------------------------------------------------
   newsdata.io's free plan is capped at 200 credits/day AND throttled to
   30 credits per 15 minutes (1 credit = 1 request = up to 10 articles) —
   that second, shorter window is what was tripping the "too many requests"
   error, since several parts of the app (Home's 3 category previews, the
   Dashboard's 7 category totals) used to fire several requests back to
   back. With no backend to funnel through anymore, all of this now lives
   here, client-side:

   1. CACHE — every unique query is kept in memory for CACHE_TTL_MS and
      reused instead of re-hitting the API.
   2. QUEUE — every outgoing request is spaced out by MIN_INTERVAL_MS so
      bursts (like the Dashboard's 7 calls) go out one at a time instead
      of all at once.
   3. DEDUPE — if the same query is already in flight, later callers just
      wait on that one instead of firing a duplicate (also quietly fixes
      React StrictMode's double-effect in dev).
   ------------------------------------------------------------------------- */
const CACHE_TTL_MS = 20 * 60 * 1000 // 20 minutes
const MIN_INTERVAL_MS = 1500        // spacing between outgoing requests

const cache = new Map()
const inFlight = new Map()
let queueTail = Promise.resolve()

const cacheKey = (endpoint, params) => `${endpoint}::${JSON.stringify(Object.entries(params).sort())}`
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getCached = (key) => {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.time > CACHE_TTL_MS) { cache.delete(key); return null }
  return hit.data
}
const setCached = (key, data) => cache.set(key, { data, time: Date.now() })

function enqueue(task) {
  const result = queueTail.then(() => task())
  queueTail = result.then(() => wait(MIN_INTERVAL_MS), () => wait(MIN_INTERVAL_MS))
  return result
}

// newsdata.io article -> the shape every component already expects
// (this app used to talk to NewsAPI/GNews, so this keeps NewsCard,
// Dashboard, etc. unchanged).
const normalizeArticle = (a) => ({
    title: a.title,
    description: a.description,
    url: a.link,
    urlToImage: a.image_url,
    publishedAt: a.pubDate,
    source: {
        name: a.source_name
    },
    source_id: a.source_id
})

// newsdata.io's own schema flags near-duplicate wire stories with
// `duplicate: true` — that flag was never being checked, so the same
// story from two syndication paths could show up twice. On top of that,
// dedupe by title/url as a safety net for duplicates the API doesn't flag.
function dedupeArticles(rawResults = []) {
  const seen = new Set()

  return rawResults.filter((a) => {
    if (a.duplicate === true) return false

    const key = [
      a.title?.trim(),
      a.source_id,
      a.link
    ]
      .filter(Boolean)
      .join("|")
      .toLowerCase()

    if (!key || seen.has(key)) return false

    seen.add(key)
    return true
  })
}

const emptyResult = (error = null) => ({ articles: [], totalResults: 0, error, nextPage: null })

async function callNewsdata(endpoint, params) {
  const key = cacheKey(endpoint, params)

  const cached = getCached(key)
  if (cached) return cached

  if (inFlight.has(key)) return inFlight.get(key)

  const promise = enqueue(async () => {
    try {
      const res = await client.get(endpoint, { params })

      // Remove duplicates first, then normalize
      const articles = dedupeArticles(res.data.results || []).map(normalizeArticle)

      const result = {
        articles,
        totalResults: articles.length,
        nextPage: res.data.nextPage || null,
        error: null
      }

      setCached(key, result)
      return result

    } catch (err) {
      const message =
        err.response?.data?.results?.message ||
        err.response?.data?.message ||
        (err.response?.status === 429
          ? "You're browsing a little fast — newsdata.io's free plan is limited to 30 requests per 15 minutes. Give it a moment and try again."
          : null) ||
        err.message ||
        "Something went wrong fetching news."

      return emptyResult(message)
    } finally {
      inFlight.delete(key)
    }
  })

  inFlight.set(key, promise)
  return promise
}

// Latest headlines for a country/category. Falls back to a country-less
// request if the combo comes back empty, so the page is never blank.
export const fetchTopHeadlines = async ({ country = 'us', category = '', page = 1, pageToken = null } = {}) => {
  const params = { country, category: toNewsdataCategory(category) }
  if (pageToken) params.page = pageToken
  const primary = await callNewsdata('/latest', params)
  if (primary.articles.length > 0 || primary.error) return primary

  const { country: _drop, ...rest } = params
  return callNewsdata('/latest', rest)
}

// Category page for a given country — same never-blank fallback.
export const fetchByCategory = async ({ category, country = 'us', page = 1, pageToken = null }) => {
  const params = { country, category: toNewsdataCategory(category) }
  if (pageToken) params.page = pageToken
  const primary = await callNewsdata('/latest', params)
  if (primary.articles.length > 0 || primary.error) return primary

  return callNewsdata('/latest', { category: toNewsdataCategory(category) })
}

export const searchNews = ({ query, page = 1, pageToken = null }) => {
  const params = { q: query }
  if (pageToken) params.page = pageToken
  return callNewsdata('/latest', params)
}

export const fetchEverything = ({ query, pageToken = null }) => {
  const params = { q: query }
  if (pageToken) params.page = pageToken
  return callNewsdata('/latest', params)
}


