import type { Category } from "./types";

// News source configuration. To add a source, add an entry here — the
// ingestion job picks it up on the next run. `hint` biases (but doesn't
// force) the AI's categorization; the AI makes the final call per article.

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
    name: "CNBC Markets",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    hint: "stocks",
  },
  {
    name: "MarketWatch",
    url: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
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
  // --- Macro / world ---
  // (CNBC Economy and AP Business feeds went dead in 2026; BBC Business
  // replaced them. Macro is also covered by the Fed and Guardian feeds.)
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
    name: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    hint: "macro",
  },
  {
    name: "NPR Economy",
    url: "https://feeds.npr.org/1017/rss.xml",
    hint: "macro",
  },
];

// The Guardian Open Platform (Tier 2) — free API key, returns full article
// body for much better summaries. Sections we pull from:
export const GUARDIAN_SECTIONS = ["business", "money", "us-news/us-economy"];
