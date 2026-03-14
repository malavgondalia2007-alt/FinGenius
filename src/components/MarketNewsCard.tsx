import React, { useCallback, useEffect, useState } from 'react';
import { Card } from './ui/Card';
import {
  Newspaper,
  ExternalLink,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle } from
'lucide-react';
import { fetchLiveNews, NewsArticle } from '../services/newsApi';
export function MarketNewsCard() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadNews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);
    try {
      const articles = await fetchLiveNews();
      if (articles.length > 0) {
        setNews(articles);
        setLastRefresh(new Date());
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    loadNews();
    // Auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        loadNews();
      },
      5 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [loadNews]);
  const displayedNews = news.slice(0, 6);
  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Market News</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNews(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh news">

            <RefreshCw
              className={`w-3.5 h-3.5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />

          </button>
          {!error && news.length > 0 &&
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </div>
          }
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto max-h-[420px] pr-1">
        {loading ?
        [1, 2, 3, 4].map((i) =>
        <div key={i} className="animate-pulse flex gap-3 p-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
        ) :
        error || displayedNews.length === 0 ?
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              Unable to load news
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check your connection and try again
            </p>
            <button
            onClick={() => loadNews(true)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">

              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div> :

        displayedNews.map((item, index) =>
        <a
          key={`${item.source}-${index}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">

              <div
            className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${item.sentiment === 'positive' ? 'bg-green-100 text-green-600' : item.sentiment === 'negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}
                  `}>

                <TrendingUp
              className={`w-5 h-5 ${item.sentiment === 'negative' ? 'rotate-180' : ''}`} />

              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {item.source}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1" />
            </a>
        )
        }
      </div>

      {lastRefresh && !loading && news.length > 0 &&
      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            Last updated:{' '}
            {lastRefresh.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
            {' · '}
            {news.length} articles from{' '}
            {new Set(news.map((n) => n.source)).size} sources
          </p>
        </div>
      }
    </Card>);

}