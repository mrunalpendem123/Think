import { useEffect, useState } from 'react';

interface Article {
  title: string;
  content: string;
  url: string;
  thumbnail: string;
}

const WeatherWidget = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);

  const updateNews = async () => {
    try {
      const res = await fetch('/api/discover?mode=preview');
      const data = await res.json();
      const articles = (data.blogs || []).filter((a: Article) => a.thumbnail);
      if (articles.length > 0) {
        setArticle(articles[Math.floor(Math.random() * articles.length)]);
      }
      setNewsLoading(false);
    } catch (error) {
      setNewsError(true);
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    updateNews();
    const newsIntervalId = setInterval(updateNews, 5 * 60 * 1000); // Update news every 5 minutes
    return () => {
      clearInterval(newsIntervalId);
    };
  }, []);

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary rounded-2xl border border-light-200 dark:border-dark-200 shadow-sm shadow-light-200/10 dark:shadow-black/25 flex flex-row items-stretch w-full h-24 min-h-[96px] max-h-[96px] p-0 overflow-hidden">
      {newsLoading ? (
        <div className="animate-pulse flex flex-row items-stretch w-full h-full">
          <div className="w-24 min-w-24 max-w-24 h-full bg-light-200 dark:bg-dark-200" />
          <div className="flex flex-col justify-center flex-1 px-3 py-2 gap-2">
            <div className="h-4 w-3/4 rounded bg-light-200 dark:bg-dark-200" />
            <div className="h-3 w-1/2 rounded bg-light-200 dark:bg-dark-200" />
          </div>
        </div>
      ) : newsError ? (
        <div className="w-full flex items-center justify-center text-xs text-black/50 dark:text-white/50 px-3">
          Could not load news.
        </div>
      ) : article ? (
        <a
          href={`/?q=Summary: ${article.url}`}
          className="flex flex-row items-stretch w-full h-full relative overflow-hidden group"
        >
          <div className="relative w-24 min-w-24 max-w-24 h-full overflow-hidden">
            <img
              className="object-cover w-full h-full bg-light-200 dark:bg-dark-200 group-hover:scale-110 transition-transform duration-300"
              src={(() => {
                try {
                  const url = new URL(article.thumbnail);
                  const id = url.searchParams.get('id');
                  return url.origin + url.pathname + (id ? `?id=${id}` : '');
                } catch {
                  return article.thumbnail;
                }
              })()}
              alt={article.title}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col justify-center flex-1 px-3 py-2">
            <div className="font-semibold text-xs text-black dark:text-white leading-tight line-clamp-2 mb-1">
              {article.title}
            </div>
            <p className="text-black/60 dark:text-white/60 text-[10px] leading-relaxed line-clamp-2">
              {article.content}
            </p>
          </div>
        </a>
      ) : null}
    </div>
  );
};

export default WeatherWidget;
