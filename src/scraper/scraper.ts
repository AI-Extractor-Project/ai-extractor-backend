import * as cheerio from 'cheerio';
const puppeteer = require('puppeteer');

export interface ScrapeResult {
    html: string;
    finalUrl: string;
    statusCode: number;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error(`Invalid URL format: "${url}" `);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error(`Unsupported protocol: ${parsedUrl.protocol}. Please check the URL`);
    }

    try {
        console.log(`[Scraper] Attempting fast fetch for ${url}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            redirect: 'follow',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const html = await response.text();

            const $ = cheerio.load(html);
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

            if (bodyText.length > 150) {
                console.log(`[Scraper] Fast fetch succeeded for ${url} (Body length: ${bodyText.length})`);
                return {
                    html,
                    finalUrl: response.url,
                    statusCode: response.status
                };
            } else {
                console.log(`[Scraper] Fast fetch returned empty/small content for ${url} (Body length: ${bodyText.length}). Likely an SPA. Falling back to Puppeteer...`);
            }
        } else {
            console.log(`[Scraper] Fast fetch failed with status ${response.status} for ${url}. Falling back to Puppeteer...`);
        }
    } catch (err) {
        console.log(`[Scraper] Fast fetch error for ${url}: ${err instanceof Error ? err.message : String(err)}. Falling back to Puppeteer...`);
    }

    console.log(`[Scraper] Launching Puppeteer for ${url}...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        if (!response) {
            throw new Error(`Failed to get response from ${url}`);
        }

        const statusCode = response.status();
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 404) {
            throw new Error(`HTTP ${statusCode} ${response.statusText()} for URL: ${url}.`);
        }

        const html = await page.content();
        const finalUrl = page.url();

        console.log(`[Scraper] Puppeteer succeeded for ${url}`);
        return {
            html,
            finalUrl,
            statusCode
        };
    } finally {
        await browser.close();
    }
}
