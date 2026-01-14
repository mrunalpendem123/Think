'use client';

import { Reply } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Section } from '@/lib/hooks/useChat';

interface SelectionPosition {
  top: number;
  left: number;
}

const TextSelectionReply = ({
  section,
  setReplyingTo,
  containerRef,
}: {
  section: Section;
  setReplyingTo: (section: Section, selectedText?: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSelection = () => {
      // Use timeout to ensure selection is complete
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        console.log('Selection detected:', { text: text?.slice(0, 50), length: text?.length });

        // Check if selection exists and has text (minimum 3 characters to avoid accidental selections)
        if (text && text.length >= 3) {
          // Check if the selection is within our container
          const anchorNode = selection?.anchorNode;
          const focusNode = selection?.focusNode;
          
          const isInContainer = 
            containerRef.current?.contains(anchorNode || null) ||
            containerRef.current?.contains(focusNode || null);
          
          console.log('Is in container:', isInContainer, containerRef.current);
          
          if (isInContainer) {
            setSelectedText(text);

            // Get the selection's bounding rectangle
            try {
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                console.log('Selection rect:', rect);

                if (rect && rect.width > 0 && rect.height > 0) {
                  // Position the button above the selection, centered
                  const top = rect.top - 50; // Position above selection
                  const left = rect.left + rect.width / 2;
                  
                  setPosition({
                    top: Math.max(10, top), // Ensure it doesn't go off top of screen
                    left: Math.max(50, Math.min(window.innerWidth - 50, left)), // Keep on screen
                  });
                  
                  console.log('Button positioned at:', { top, left });
                }
              }
            } catch (error) {
              console.error('Error getting selection rect:', error);
            }
          } else {
            setSelectedText('');
            setPosition(null);
          }
        } else {
          setSelectedText('');
          setPosition(null);
        }
      }, 100); // Small delay to ensure selection is complete
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Don't clear if clicking inside the container
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      
      // Clear selection if clicking outside the button
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setSelectedText('');
        setPosition(null);
      }
    };

    // Use mouseup for immediate feedback after selection
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  if (!position || !selectedText) return null;

  return (
    <div
      ref={buttonRef}
      className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={() => {
          console.log('Reply button clicked with text:', selectedText.slice(0, 50));
          setReplyingTo(section, selectedText);
          setSelectedText('');
          setPosition(null);
          // Clear selection
          window.getSelection()?.removeAllRanges();
          // Focus input
          setTimeout(() => {
            const textarea = document.querySelector('textarea');
            textarea?.focus();
            textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }}
        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-xl border-2 border-white/20 flex items-center gap-2 transition-all duration-200 hover:scale-105 whitespace-nowrap"
      >
        <Reply size={16} />
        <span className="text-sm font-medium">Reply</span>
      </button>
    </div>
  );
};

export default TextSelectionReply;

