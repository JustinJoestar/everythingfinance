import type { Category } from "./types";

// News source configuration. To add a source, add an entry here — the
// ingestion job picks it up on the next run. `hint` biases (but doesn't
// force) the AI's categorization; the AI makes the final call per article.
// The relevance filter screens every item, so opinion and stock-picking
// heavy feeds still only contribute their real news.

export interface RssSource {
  name: string;
  url: string;
  hint: Category;
}

export const RSS_SOURCES: RssSource[] = [
  // --- Stocks / markets ---
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    hint: "stocks",
  },
  {
    // The old CNBC Markets feed went stale in 2026; Top News is active.
    name: "CNBC",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    hint: "stocks",
  },
  {
    name: "MarketWatch",
    url: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    hint: "stocks",
  },
  {
    name: "Seeking Alpha",
    url: "https://seekingalpha.com/market_currents.xml",
    hint: "stocks",
  },
  {
    name: "Investing.com",
    url: "https://www.investing.com/rss/news.rss",
    hint: "stocks",
  },
  // --- Crypto ---
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    hint: "crypto",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    hint: "crypto",
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    hint: "crypto",
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    hint: "crypto",
  },
  // --- Macro ---
  {
    name: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    hint: "macro",
  },
  {
    name: "ECB",
    url: "https://www.ecb.europa.eu/rss/press.html",
    hint: "macro",
  },
  {
    name: "NPR Economy",
    url: "https://feeds.npr.org/1017/rss.xml",
    hint: "macro",
  },
  {
    name: "NPR Business",
    url: "https://feeds.npr.org/1006/rss.xml",
    hint: "macro",
  },
  {
    name: "Investing.com Economy",
    url: "https://www.investing.com/rss/news_14.rss",
    hint: "macro",
  },
  {
    name: "Sky News Business",
    url: "https://feeds.skynews.com/feeds/rss/business.xml",
    hint: "macro",
  },
  // --- World ---
  {
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    hint: "world",
  },
  {
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    hint: "world",
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    hint: "world",
  },
  {
    name: "DW",
    url: "https://rss.dw.com/rdf/rss-en-world",
    hint: "world",
  },
];

// The Guardian Open Platform (Tier 2) — free API key, returns full article
// body for much better summaries. Sections we pull from:
export const GUARDIAN_SECTIONS = [
  "business",
  "money",
  "us-news/us-economy",
  "world",
];
