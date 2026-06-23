export interface HeadingCounts {
    h1: number;
    h2: number;
    h3: number;
}

export interface LinkCounts {
    internal: number;
    external: number;
}

export interface PageMetrics {
    wordCount: number;
    headings: HeadingCounts;
    paragraphCount: number;
    metaTitle: string | null;
    metaTitleLength: number;
    metaDescription: string | null;
    metaDescriptionLength: number;
    ctaCount: number;
    ctaTexts: string[];
    links: LinkCounts;
    imageCount: number;
    imagesWithAlt: number;
    imagesMissingAlt: number;
    missingAltPercent: number;
    pageTitle: string | null;
    bodyTextSample: string;
    url: string;
}
