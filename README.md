# AI-Powered Website Audit Tool (Backend)

This is the backend API for the AI-Native Software Engineer 24-Hour Assignment. It is built with Node.js, Express, TypeScript, and Google Gemini to scrape a single webpage, extract key metrics, and generate structured AI insights.

## Tech Stack
- **Framework:** Express.js & TypeScript
- **Scraping:** Cheerio (Fast parsing) & Puppeteer (Fallback for dynamic sites)
- **AI Model:** Google Gemini 2.5 Flash
- **Caching:** Redis (`ioredis`)
- **Validation:** Zod

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file and add your keys:
   ```env
   PORT=5000
   GEMINI_API_KEY_1=your_key_here
   REDIS_URL=rediss://default:password@endpoint:port
   CACHE_TTL_SECONDS=900
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## How to use

You can interact with the backend in two ways:

**1. API Endpoint:**
Send a POST request to `http://localhost:5000/api/v1/audit` with a JSON body:
```json
{
  "url": "https://example.com"
}
```

**2. CLI Tool:**
Run the audit directly from your terminal:
```bash
npx ts-node src/cli.ts https://example.com
```

---

## Architecture Overview

The backend is built with a clean separation of concerns:
- **Scraping Layer:** Tries a lightning-fast `fetch` request first. If the website is an SPA (Single Page Application) or blocks the request, it automatically falls back to headless Puppeteer.
- **Metrics Extraction Layer:** Uses Cheerio to parse the HTML and accurately extract factual data (word count, headings, CTAs, alt text) without any AI involvement.
- **AI Layer:** Takes the factual metrics and sends a highly structured prompt to Google Gemini. 
- **Caching Layer:** Saves the final JSON result in Redis for 15 minutes to save time and API costs if the same URL is audited again.

## AI Design Decisions

- **Strict JSON Output:** The AI prompt forces Gemini to return a strict JSON format matching our Zod schemas. This ensures the frontend receives predictable data without needing to parse messy text.
- **Metric Grounding:** To prevent the AI from hallucinating (making things up), the prompt forces the AI to explicitly reference the extracted metrics in its reasoning (e.g., "Only 0 CTAs found"). The schema actually requires a `metricReference` field for every insight.
- **API Key Rotation:** To handle free-tier API rate limits gracefully, the AI client automatically rotates through multiple Gemini API keys if one gets rate-limited.

## Trade-offs

- **Fetch vs. Puppeteer:** Running a full headless browser (Puppeteer) is slow and heavy. By attempting a standard `fetch` first, we trade a tiny bit of initial complexity for a massive speed boost on 80% of websites.
- **Single Page vs. Full Site Crawl:** Crawling a whole website takes minutes. By restricting the scope to a single URL, we can keep the system fast enough to return a response in a single HTTP request (usually ~10-15 seconds) without needing complex Websockets.
- **Redis Cache vs. Database:** We chose a temporary Redis cache instead of a persistent PostgreSQL database to keep the system lightweight and ensure users always get relatively fresh data (max 15 mins old).

## What I would improve with more time

- **Scraper Enhancements:** Expand the scraping logic to extract content from Shadow DOMs and better handle complex Single-Page Applications (SPAs).
- **Advanced Prompt Engineering:** Implement few-shot prompting (providing the AI with multiple pre-analyzed examples) to guarantee even more consistent and highly-nuanced SEO insights.
- **Cache Management:** Add an endpoint to allow users to manually invalidate/clear the Redis cache for a specific URL if they know the website was just updated.
