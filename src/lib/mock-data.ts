import { etDateString, etWeekStart } from "./dates";
import type { Article, Flashcard, Quiz, Recap } from "./types";

// Sample content served when Supabase isn't configured, so the app is
// fully browsable in local development before any accounts/keys exist.
// Once Supabase + the ingestion job are live, none of this is used.

const h = 3_600_000;
const ago = (hours: number) => new Date(Date.now() - hours * h).toISOString();

export const MOCK_ARTICLES: Article[] = [
  {
    id: "m1",
    url: "https://example.com/fed-holds-rates",
    source: "Sample Wire",
    title: "Fed holds interest rates steady, signals possible cut in September",
    summary:
      "The Federal Reserve kept its key interest rate unchanged but hinted it may lower rates later this year if inflation keeps cooling. Lower rates make borrowing cheaper, which tends to boost both the economy and stock prices.",
    categories: ["macro"],
    published_at: ago(2),
  },
  {
    id: "m2",
    url: "https://example.com/nvidia-earnings",
    source: "Sample Wire",
    title: "Nvidia beats earnings expectations as AI chip demand stays hot",
    summary:
      "Nvidia, the company making most of the chips that power AI, reported quarterly profits well above what analysts predicted. The stock rose after hours, lifting other tech shares with it.",
    categories: ["stocks"],
    published_at: ago(4),
  },
  {
    id: "m3",
    url: "https://example.com/bitcoin-etf-flows",
    source: "Sample Wire",
    title: "Bitcoin climbs past $120,000 as ETF inflows accelerate",
    summary:
      "Bitcoin hit a new multi-week high as large investors poured money into bitcoin ETFs, funds that let people buy bitcoin exposure through a normal brokerage account. Steady ETF demand has been a major driver of this year's rally.",
    categories: ["crypto"],
    published_at: ago(5),
  },
  {
    id: "m4",
    url: "https://example.com/oil-prices-strait",
    source: "Sample Wire",
    title: "Oil prices jump 3% on renewed Middle East supply concerns",
    summary:
      "Crude oil rose sharply after reports of new tensions near a key shipping route for global oil. When oil gets more expensive, gas prices tend to follow, which can push inflation back up. That's one reason markets watch geopolitics closely.",
    categories: ["world"],
    published_at: ago(7),
  },
  {
    id: "m5",
    url: "https://example.com/jobs-report",
    source: "Sample Wire",
    title: "US adds 180,000 jobs in June, unemployment steady at 4.1%",
    summary:
      "The monthly jobs report showed solid but not overheated hiring. That's the 'goldilocks' zone investors like: enough growth to avoid recession worries, but not so much that the Fed needs to keep rates high.",
    categories: ["macro"],
    published_at: ago(10),
  },
  {
    id: "m6",
    url: "https://example.com/apple-services",
    source: "Sample Wire",
    title: "Apple shares rise on record services revenue",
    summary:
      "Apple's subscription businesses (the App Store, iCloud, Apple Music) brought in more money than ever last quarter. Investors like services revenue because it's steadier than iPhone sales, which rise and fall with upgrade cycles.",
    categories: ["stocks"],
    published_at: ago(13),
  },
  {
    id: "m7",
    url: "https://example.com/eth-upgrade",
    source: "Sample Wire",
    title: "Ethereum upgrade cuts transaction fees by 40%",
    summary:
      "Ethereum completed a network upgrade that makes using apps built on it significantly cheaper. Lower fees matter because high costs have historically pushed users to competing blockchains.",
    categories: ["crypto"],
    published_at: ago(16),
  },
  {
    id: "m8",
    url: "https://example.com/ecb-cut",
    source: "Sample Wire",
    title: "European Central Bank cuts rates for third time this year",
    summary:
      "Europe's central bank lowered interest rates again as inflation there falls faster than in the US. Diverging paths between the ECB and the Fed can move currency markets, since money flows toward higher rates.",
    categories: ["macro", "world"],
    published_at: ago(20),
  },
  {
    id: "m9",
    url: "https://example.com/tariff-talks",
    source: "Sample Wire",
    title: "US and EU resume trade talks amid tariff threats on autos",
    summary:
      "Negotiators are trying to head off new tariffs, or import taxes, on European cars. Tariffs raise prices for consumers and can spark retaliation, so trade headlines often move automaker and industrial stocks.",
    categories: ["world"],
    published_at: ago(26),
  },
  {
    id: "m10",
    url: "https://example.com/sp-record",
    source: "Sample Wire",
    title: "S&P 500 notches another record close as earnings season kicks off",
    summary:
      "The main US stock index hit an all-time high as investors bet that quarterly company results will come in strong. About a quarter of S&P 500 companies report earnings over the next two weeks.",
    categories: ["stocks"],
    published_at: ago(30),
  },
  {
    id: "m11",
    url: "https://example.com/stablecoin-law",
    source: "Sample Wire",
    title: "Senate advances stablecoin regulation bill with bipartisan support",
    summary:
      "Lawmakers moved forward on rules for stablecoins, cryptocurrencies pegged to the dollar. Regulation with clear rules lets banks and big companies join in without legal uncertainty, which most of the industry wants.",
    categories: ["crypto", "world"],
    published_at: ago(34),
  },
  {
    id: "m12",
    url: "https://example.com/cpi-cooling",
    source: "Sample Wire",
    title: "Inflation cools to 2.6% in June, closer to the Fed's 2% target",
    summary:
      "Consumer prices rose 2.6% over the past year, the smallest increase in months. Cooling inflation strengthens the case for the Fed to cut interest rates, which is why stocks and bonds both rallied on the news.",
    categories: ["macro"],
    published_at: ago(40),
  },
];

export const MOCK_RECAP: Recap = {
  recap_date: etDateString(),
  bullets: [
    "The Federal Reserve held interest rates steady but opened the door to a cut in September. Markets rallied on the hint of cheaper borrowing ahead.",
    "Nvidia's big earnings beat kept the AI trade alive and pushed the S&P 500 to another record close.",
    "Bitcoin broke above $120,000 as money kept flowing into bitcoin ETFs.",
    "Oil jumped 3% on Middle East supply worries, the kind of news that can feed straight back into inflation.",
  ],
};

export const MOCK_QUIZ: Quiz = {
  id: "mock-quiz",
  week_start: etWeekStart(),
  questions: [
    {
      question: "What did the Federal Reserve do with interest rates this week?",
      options: [
        "Held them steady, hinting at a future cut",
        "Raised them by half a percent",
        "Cut them immediately",
        "Eliminated interest rates entirely",
      ],
      answer: 0,
      explanation:
        "The Fed kept rates unchanged but signaled it may cut later this year if inflation keeps cooling.",
    },
    {
      question: "Why did Nvidia's stock rise after its earnings report?",
      options: [
        "It announced a new video game console",
        "Profits beat expectations thanks to AI chip demand",
        "It merged with Apple",
        "It paid off all its debt",
      ],
      answer: 1,
      explanation:
        "Nvidia earned more than analysts predicted because demand for its AI chips remains extremely strong.",
    },
    {
      question: "What has been a major driver of bitcoin's rally this year?",
      options: [
        "A new bitcoin video game",
        "Banks banning cash",
        "Money flowing into bitcoin ETFs",
        "A drop in electricity prices",
      ],
      answer: 2,
      explanation:
        "Bitcoin ETFs let ordinary investors buy bitcoin exposure through regular brokerage accounts, and steady inflows have pushed the price up.",
    },
    {
      question: "Why do markets care about tensions near oil shipping routes?",
      options: [
        "Oil tankers carry stock certificates",
        "Supply disruptions can raise oil prices and feed inflation",
        "They delay package deliveries",
        "They don't; oil is unrelated to markets",
      ],
      answer: 1,
      explanation:
        "If oil supply is threatened, prices rise, gas gets more expensive, and inflation can climb, which affects interest rates and stocks.",
    },
    {
      question: "June's inflation reading of 2.6% matters because…",
      options: [
        "It's the highest reading in a decade",
        "It moves the Fed closer to its 2% target, supporting rate cuts",
        "It means prices are falling",
        "It only affects Europe",
      ],
      answer: 1,
      explanation:
        "Cooling inflation gives the Fed room to lower interest rates, which markets generally welcome.",
    },
  ],
};

export const MOCK_FLASHCARDS: Flashcard[] = [
  { id: "mf1", week_start: etWeekStart(), category: "macro", front: "What does it mean when the Fed 'holds rates steady'?", back: "The central bank left its key interest rate unchanged, so borrowing costs stay the same for now. Markets then focus on hints about the next move." },
  { id: "mf2", week_start: etWeekStart(), category: "macro", front: "Why do stocks usually like rate cuts?", back: "Lower rates make borrowing cheaper for companies and make savings accounts less attractive, pushing money toward stocks." },
  { id: "mf3", week_start: etWeekStart(), category: "stocks", front: "What is an earnings report?", back: "A company's quarterly report card showing profit and revenue. Stocks jump or drop based on whether results beat or miss expectations." },
  { id: "mf4", week_start: etWeekStart(), category: "crypto", front: "What is a bitcoin ETF?", back: "A fund traded on the stock market that tracks bitcoin's price, letting people invest through a normal brokerage account without holding crypto themselves." },
  { id: "mf5", week_start: etWeekStart(), category: "world", front: "How can Middle East tensions affect your gas prices?", back: "A lot of the world's oil ships through that region. Threats to supply push oil prices up, and gas prices follow within weeks." },
  { id: "mf6", week_start: etWeekStart(), category: "macro", front: "What is CPI?", back: "The Consumer Price Index, the main US inflation measure. It tracks prices of everyday goods, and its monthly release regularly moves markets." },
  { id: "mf7", week_start: etWeekStart(), category: "stocks", front: "What does 'record close' mean?", back: "The index ended the trading day at its highest level ever. It signals strong investor optimism, though records alone don't predict what happens next." },
  { id: "mf8", week_start: etWeekStart(), category: "crypto", front: "What is a stablecoin?", back: "A cryptocurrency designed to always be worth $1, backed by real reserves. Traders use them as digital cash inside the crypto world." },
];
