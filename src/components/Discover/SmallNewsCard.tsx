import { Discover } from '@/app/discover/page';
import Link from 'next/link';

const SmallNewsCard = ({ item }: { item: Discover }) => (
  <Link
    href={`/?q=Summary: ${item.url}`}
    className="rounded-3xl overflow-hidden bg-light-secondary dark:bg-dark-secondary shadow-sm shadow-light-200/10 dark:shadow-black/25 group flex flex-col"
    target="_blank"
  >
    <div className="relative aspect-video overflow-hidden">
      <img
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        src={item.thumbnail}
        alt={item.title}
        onError={(e) => {
          // Fallback to a placeholder if image fails to load
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
        }}
      />
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-sm mb-2 leading-tight line-clamp-2 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition duration-200">
        {item.title}
      </h3>
      <p className="text-black/60 dark:text-white/60 text-xs leading-relaxed line-clamp-2">
        {item.content}
      </p>
    </div>
  </Link>
);

export default SmallNewsCard;
