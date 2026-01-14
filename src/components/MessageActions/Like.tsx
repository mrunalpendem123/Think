import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

const Like = ({
  messageId,
  chatId,
}: {
  messageId: string;
  chatId: string;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Load like state from localStorage
  useEffect(() => {
    const likeKey = `like_${chatId}_${messageId}`;
    const liked = localStorage.getItem(likeKey) === 'true';
    setIsLiked(liked);
    
    // Load like count (for future multi-user support)
    const countKey = `likeCount_${chatId}_${messageId}`;
    const count = parseInt(localStorage.getItem(countKey) || '0');
    setLikeCount(count);
  }, [messageId, chatId]);

  const handleLike = () => {
    const likeKey = `like_${chatId}_${messageId}`;
    const countKey = `likeCount_${chatId}_${messageId}`;
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Update count
    const newCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(newCount);
    
    // Save to localStorage
    localStorage.setItem(likeKey, String(newLikedState));
    localStorage.setItem(countKey, String(newCount));
  };

  return (
    <button
      onClick={handleLike}
      className="py-2 px-3 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex flex-row items-center space-x-1"
    >
      <Heart 
        size={18} 
        className={isLiked ? 'fill-red-500 text-red-500' : ''}
      />
      <p className="text-xs font-medium">
        {isLiked ? 'Liked' : 'Like'}
        {likeCount > 0 && ` (${likeCount})`}
      </p>
    </button>
  );
};

export default Like;

