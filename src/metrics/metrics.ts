import * as cheerio from 'cheerio';
import type { PageMetrics } from './metrics.types';

const CTA_KEYWORDS = [
    'get started', 'start free', 'sign up', 'signup', 'sign-up',
    'buy now', 'buy', 'shop', 'purchase', 'order',
    'subscribe', 'join', 'register',
    'try', 'try free', 'try now', 'free trial',
    'download', 'install',
    'contact us', 'contact', 'get in touch',
    'learn more', 'find out more', 'discover',
    'book', 'book now', 'schedule', 'reserve',
    'get a demo', 'request demo', 'demo',
    'get quote', 'get pricing', 'pricing',
    'apply', 'apply now',
];


function isCTA(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return CTA_KEYWORDS.some(keyword => lower.includes(keyword));
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function classifyLinks(html: string, pageUrl: string): { internal: number; external: number } {
    const $ = cheerio.load(html);

    let internal = 0;
    let external = 0;

    let pageHostname: string;

    try {
        pageHostname = new URL(pageUrl).hostname;
    } catch {
        pageHostname = '';
    }

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';

        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        let resolved: URL;

        try {
            resolved = new URL(href, pageUrl);
        } catch {
            return;
        }

        if (resolved.hostname === pageHostname) {
            internal++;
        } else {
            external++;
        }
    });

    return { internal, external };
}

export function extractMetrics(html: string, pageUrl: string): PageMetrics {
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe').remove();

    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    const metaTitle = $('title').first().text().trim() || null;
    const metaTitleLength = metaTitle?.length ?? 0;

    const metaDescriptionEl = $('meta[name="description"]');
    const metaDescription = metaDescriptionEl.attr('content')?.trim() || null;
    const metaDescriptionLength = metaDescription?.length ?? 0;

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = countWords(bodyText);
    const bodyTextSample = bodyText.slice(0, 3000);

    const paragraphCount = $('p').length;

    const ctaTexts: string[] = [];

    $('button, a[href]').each((_, el) => {
        const text = $(el).text().trim();
        if (text && isCTA(text) && !ctaTexts.includes(text)) {
            ctaTexts.push(text);
        }
    });

    const ctaCount = ctaTexts.length;

    const links = classifyLinks(html, pageUrl);

    const allImages = $('img');
    const imageCount = allImages.length;

    let imagesWithAlt = 0;
    let imagesMissingAlt = 0;

    allImages.each((_, el) => {
        const alt = $(el).attr('alt');
        if (alt !== undefined && alt !== null) {
            imagesWithAlt++;
        } else {
            imagesMissingAlt++;
        }
    });

    const missingAltPercent = imageCount === 0 ? 0 : Math.round((imagesMissingAlt / imageCount) * 1000) / 10;

    return {
        wordCount,
        headings: { h1: h1Count, h2: h2Count, h3: h3Count },
        paragraphCount,
        metaTitle,
        metaTitleLength,
        metaDescription,
        metaDescriptionLength,
        ctaCount,
        ctaTexts: ctaTexts.slice(0, 10),
        links,
        imageCount,
        imagesWithAlt,
        imagesMissingAlt,
        missingAltPercent,
        pageTitle: metaTitle,
        bodyTextSample,
        url: pageUrl,
    };
}