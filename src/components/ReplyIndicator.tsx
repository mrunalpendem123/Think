import { X } from 'lucide-react';
import { Section } from '@/lib/hooks/useChat';
import { useChat } from '@/lib/hooks/useChat';

const ReplyIndicator = ({
  replyingTo,
  onClose,
}: {
  replyingTo: Section;
  onClose: () => void;
}) => {
  const { replyingToText } = useChat();
  
  return (
    <div className="bg-light-secondary dark:bg-dark-secondary border-l-4 border-cyan-500 dark:border-cyan-400 px-4 py-3 flex items-start justify-between gap-3 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-1">
          {replyingToText ? 'Replying to selected text' : 'Replying to'}
        </p>
        {replyingToText ? (
          <p className="text-sm text-black/80 dark:text-white/80 line-clamp-2 italic">
            "{replyingToText}"
          </p>
        ) : (
          <>
            <p className="text-sm text-black/80 dark:text-white/80 line-clamp-2">
              {replyingTo.userMessage.content}
            </p>
            {replyingTo.assistantMessage && (
              <p className="text-xs text-black/60 dark:text-white/60 mt-1 line-clamp-1">
                {replyingTo.assistantMessage.content.slice(0, 100)}...
              </p>
            )}
          </>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors flex-shrink-0"
        aria-label="Cancel reply"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ReplyIndicator;

