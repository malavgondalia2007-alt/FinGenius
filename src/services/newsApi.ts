// Live News Service
// Fetches real Indian financial news from RSS feeds via CORS proxy
// No API key required — uses public RSS feeds from major financial news sources

const CORS_PROXIES = [
'https://corsproxy.io/?',
'https://api.allorigins.win/raw?url='];


const NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedNews {
  data: NewsArticle[];
  timestamp: number;
}

let newsCache: CachedNews | null = null;

export interface NewsArticle {
  title: string;
  source: string;
  time: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publishedAt: Date;
}

// RSS Feed sources — Indian financial news
const RSS_FEEDS = [
{
  url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
  source: 'Economic Times'
},
{
  url: 'https://www.moneycontrol.com/rss/marketreports.xml',
  source: 'MoneyControl'
},
{
  url: 'https://www.livemint.com/rss/markets',
  source: 'LiveMint'
},
{
  url: 'https://www.business-standard.com/rss/markets-106.rss',
  source: 'Business Standard'
}];


// Keywords for sentiment analysis
const POSITIVE_KEYWORDS = [
'surge',
'rally',
'gain',
'jump',
'rise',
'soar',
'high',
'bull',
'record',
'profit',
'growth',
'boost',
'up',
'positive',
'recover',
'outperform',
'beat',
'strong',
'upgrade',
'buy',
'boom',
'peak',
'advance',
'climbs',
'hits high',
'all-time',
'breakout'];


const NEGATIVE_KEYWORDS = [
'fall',
'drop',
'crash',
'decline',
'loss',
'bear',
'low',
'dip',
'plunge',
'tumble',
'slip',
'down',
'negative',
'weak',
'sell',
'downgrade',
'cut',
'fear',
'risk',
'concern',
'slump',
'tank',
'plummet',
'retreat',
'sink',
'drag'];


function analyzeSentiment(title: string): 'positive' | 'negative' | 'neutral' {
  const lower = title.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  for (const keyword of POSITIVE_KEYWORDS) {
    if (lower.includes(keyword)) positiveScore++;
  }
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (lower.includes(keyword)) negativeScore++;
  }

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function parseRSSXml(xmlText: string, sourceName: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.warn(`RSS parse error for ${sourceName}`);
      return [];
    }

    const items = xmlDoc.querySelectorAll('item');

    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';

      if (!title || !link) return;

      // Skip items with CDATA that didn't parse well
      const cleanTitle = title.
      replace(/<!\[CDATA\[/g, '').
      replace(/\]\]>/g, '').
      replace(/<[^>]*>/g, '').
      trim();

      if (!cleanTitle) return;

      const publishedAt = pubDate ? new Date(pubDate) : new Date();
      // Skip articles older than 48 hours
      const ageMs = Date.now() - publishedAt.getTime();
      if (ageMs > 48 * 60 * 60 * 1000) return;

      articles.push({
        title: cleanTitle,
        source: sourceName,
        time: getRelativeTime(publishedAt),
        url: link.
        replace(/<!\[CDATA\[/g, '').
        replace(/\]\]>/g, '').
        trim(),
        sentiment: analyzeSentiment(cleanTitle),
        publishedAt
      });
    });
  } catch (error) {
    console.warn(`Failed to parse RSS from ${sourceName}:`, error);
  }

  return articles;
}

async function fetchRSSFeed(
feedUrl: string,
sourceName: string)
: Promise<NewsArticle[]> {
  for (const proxy of CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const proxyUrl = `${proxy}${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/rss+xml, application/xml, text/xml' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const text = await response.text();
      const articles = parseRSSXml(text, sourceName);

      if (articles.length > 0) {
        return articles;
      }
    } catch (error) {
      continue;
    }
  }

  return [];
}

export async function fetchLiveNews(): Promise<NewsArticle[]> {
  // Check cache first
  if (newsCache && Date.now() - newsCache.timestamp < NEWS_CACHE_DURATION) {
    return newsCache.data;
  }

  console.log('📰 Fetching live market news from RSS feeds...');

  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchRSSFeed(feed.url, feed.source))
  );

  let allArticles: NewsArticle[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allArticles = [...allArticles, ...result.value];
    }
  });

  if (allArticles.length === 0) {
    console.warn('⚠️ No live news available from any source');
    return [];
  }

  // Sort by publish date (newest first)
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  // Deduplicate by similar titles (fuzzy match)
  const seen = new Set<string>();
  const deduplicated = allArticles.filter((article) => {
    // Create a simplified key from the first 40 chars
    const key = article.title.
    toLowerCase().
    slice(0, 40).
    replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Take top 20 articles
  const finalArticles = deduplicated.slice(0, 20);

  console.log(
    `✅ Fetched ${finalArticles.length} live news articles from ${new Set(finalArticles.map((a) => a.source)).size} sources`
  );

  // Cache results
  newsCache = { data: finalArticles, timestamp: Date.now() };

  return finalArticles;
}

// Clear news cache
export function clearNewsCache(): void {
  newsCache = null;
}