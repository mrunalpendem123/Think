'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import MessageInput from './MessageInput';
import MessageBoxLoading from './MessageBoxLoading';
import MessageSection from './MessageSection';

const CrayonChatWrapper: React.FC = () => {
  const {
    loading,
    sendMessage,
    sections,
    messageAppeared,
    chatTurns,
    rewrite,
    setReplyingTo,
    messages,
  } = useChat();

  const messageEnd = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const [dividerWidth, setDividerWidth] = React.useState(0);

  // Memoize template messages per section to avoid expensive filtering on every render
  const templateMessagesBySection = useMemo(() => {
    if (!messages || messages.length === 0) return new Map<string, any[]>();
    
    const map = new Map<string, any[]>();
    
    sections.forEach((section) => {
      const userMessageTime = section.userMessage.createdAt instanceof Date 
        ? section.userMessage.createdAt.getTime()
        : new Date(section.userMessage.createdAt).getTime();
      
      const templateMessages = messages.filter((msg: any) => {
        if (msg.role !== 'template' || msg.chatId !== section.userMessage.chatId) {
          return false;
        }
        const msgTime = msg.createdAt instanceof Date 
          ? msg.createdAt.getTime()
          : new Date(msg.createdAt).getTime();
        return msgTime >= userMessageTime;
      });
      
      map.set(section.userMessage.messageId, templateMessages);
    });
    return map;
  }, [sections, messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    const scroll = () => {
      messageEnd.current?.scrollIntoView({ behavior: 'auto' });
    };

    if (chatTurns.length === 1) {
      document.title = `${chatTurns[0].content.substring(0, 30)} - Think Fast`;
    }

    const messageEndBottom =
      messageEnd.current?.getBoundingClientRect().bottom ?? 0;

    const distanceFromMessageEnd = window.innerHeight - messageEndBottom;

    if (distanceFromMessageEnd >= -100) {
      scroll();
    }

    if (chatTurns[chatTurns.length - 1]?.role === 'user') {
      scroll();
    }
  }, [chatTurns]);

  // Track divider width for fixed input
  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.offsetWidth);
      }
    };

    updateDividerWidth();
    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-6 pt-8 pb-44 lg:pb-32 sm:mx-4 md:mx-8">
      {sections.map((section, i) => {
        const isLast = i === sections.length - 1;
        const templateMessages = templateMessagesBySection.get(section.userMessage.messageId) || [];

        return (
          <React.Fragment key={section.userMessage.messageId}>
            <div ref={isLast ? dividerRef : undefined}>
              <MessageSection
                section={section}
                isLast={isLast}
                loading={loading}
                templateMessages={templateMessages}
                sendMessage={sendMessage}
                rewrite={rewrite}
                setReplyingTo={setReplyingTo}
              />
            </div>

            {!isLast && (
              <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
            )}
          </React.Fragment>
        );
      })}
      
      {loading && !messageAppeared && <MessageBoxLoading />}
      <div ref={messageEnd} className="h-0" />
      
      {dividerWidth > 0 && (
        <div
          className="bottom-24 lg:bottom-10 fixed z-40"
          style={{ width: dividerWidth }}
        >
          <MessageInput />
        </div>
      )}
    </div>
  );
};

export default CrayonChatWrapper;
