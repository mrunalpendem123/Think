import { Reply as ReplyIcon } from 'lucide-react';
import { Section } from '@/lib/hooks/useChat';

const Reply = ({
  section,
  setReplyingTo,
}: {
  section: Section;
  setReplyingTo: (section: Section) => void;
}) => {
  return (
    <button
      onClick={() => setReplyingTo(section)}
      className="py-2 px-3 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex flex-row items-center space-x-1"
    >
      <ReplyIcon size={18} />
      <p className="text-xs font-medium">Reply</p>
    </button>
  );
};

export default Reply;

