'use client';

import { Section } from '@/lib/hooks/useChat';
import { BookCopy, Plus, StopCircle, Volume2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { useRef } from 'react';
import { useSpeech } from 'react-text-to-speech';
import Citation from './Citation';
import Copy from './MessageActions/Copy';
import Like from './MessageActions/Like';
import Reply from './MessageActions/Reply';
import Rewrite from './MessageActions/Rewrite';
import ChartTemplate from './templates/ChartTemplate';
import SourcesTemplate from './templates/SourcesTemplate';
import StockChartTemplate from './templates/StockChartTemplate';
import TextSelectionReply from './TextSelectionReply';

interface MessageSectionProps {
  section: Section;
  isLast: boolean;
  loading: boolean;
  templateMessages: any[];
  sendMessage: (message: string) => void;
  rewrite: (messageId: string) => void;
  setReplyingTo: (section: Section) => void;
}

const MessageSection: React.FC<MessageSectionProps> = ({
  section,
  isLast,
  loading,
  templateMessages,
  sendMessage,
  rewrite,
  setReplyingTo,
}) => {
  const answerContainerRef = useRef<HTMLDivElement>(null);
  const parsedMessage = section.parsedAssistantMessage || '';
  const speechMessage = section.speechMessage || '';
  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  return (
    <>
      <div className="space-y-6">
        {/* User Message */}
        <div className={'w-full pt-8 break-words'}>
          <h2 className="text-black dark:text-white font-medium text-3xl lg:w-9/12">
            {section.userMessage.content}
          </h2>
        </div>

        <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
          <div className="flex flex-col space-y-6 w-full lg:w-9/12">
            {/* Sources */}
            {section.sourceMessage &&
              section.sourceMessage.sources.length > 0 && (
                <SourcesTemplate sources={section.sourceMessage.sources} />
              )}

            {/* Template Messages (e.g., Stock Charts) */}
            {templateMessages.map((templateMsg: any) => {
              if (templateMsg.template === 'stock_chart' && templateMsg.data) {
                const chartData = templateMsg.data.chart;
                if (chartData && chartData.elements) {
                  const mergedData: any[] = [];
                  const allDates = new Set<string>();
                  chartData.elements.forEach((el: any) => {
                    (el.points || []).forEach((p: [string, number]) => {
                      allDates.add(p[0]);
                    });
                  });

                  Array.from(allDates)
                    .sort()
                    .forEach((date) => {
                      const dataPoint: any = { date };
                      chartData.elements.forEach((el: any) => {
                        const ticker = el.ticker || el.label.split(' ')[0];
                        const point = (el.points || []).find((p: [string, number]) => p[0] === date);
                        if (point) {
                          dataPoint[ticker] = point[1];
                        }
                      });
                      mergedData.push(dataPoint);
                    });

                  const stocks = chartData.elements.map((el: any) => ({
                    symbol: el.ticker || el.label.split(' ')[0],
                    name: el.label,
                    color: undefined,
                  }));

                  return (
                    <StockChartTemplate
                      key={templateMsg.messageId}
                      title={templateMsg.data.title || 'Stock Chart'}
                      data={mergedData}
                      stocks={stocks}
                      currency={templateMsg.data.currency_symbols?.[0] || 'USD'}
                    />
                  );
                }
              } else if (templateMsg.template === 'chart' && templateMsg.data) {
                return (
                  <ChartTemplate
                    key={templateMsg.messageId}
                    type={templateMsg.data.type || 'line'}
                    data={templateMsg.data.data || []}
                    xKey={templateMsg.data.xKey}
                    yKey={templateMsg.data.yKey}
                    title={templateMsg.data.title}
                    colors={templateMsg.data.colors}
                    description={templateMsg.data.description}
                  />
                );
              }
              return null;
            })}

            {/* Answer */}
            {section.assistantMessage && (
              <>
                <div className="flex flex-col space-y-2">
                  {section.sourceMessage && (
                    <div className="flex flex-row items-center space-x-2">
                      <BookCopy className="text-black dark:text-white" size={20} />
                      <h3 className="text-black dark:text-white font-medium text-xl">
                        Answer
                      </h3>
                    </div>
                  )}
                  <div ref={answerContainerRef} className="relative select-text">
                    <Markdown
                      options={{
                        overrides: {
                          citation: {
                            component: Citation,
                          },
                          p: {
                            component: 'p',
                            props: {
                              className: 'text-black dark:text-white mb-4 leading-relaxed',
                            },
                          },
                          h1: {
                            component: 'h1',
                            props: {
                              className: 'text-black dark:text-white text-2xl font-semibold mb-4 mt-6',
                            },
                          },
                          h2: {
                            component: 'h2',
                            props: {
                              className: 'text-black dark:text-white text-xl font-semibold mb-3 mt-5',
                            },
                          },
                          h3: {
                            component: 'h3',
                            props: {
                              className: 'text-black dark:text-white text-lg font-semibold mb-2 mt-4',
                            },
                          },
                          ul: {
                            component: 'ul',
                            props: {
                              className: 'list-disc list-inside mb-4 text-black dark:text-white space-y-2',
                            },
                          },
                          ol: {
                            component: 'ol',
                            props: {
                              className: 'list-decimal list-inside mb-4 text-black dark:text-white space-y-2',
                            },
                          },
                          code: {
                            component: 'code',
                            props: {
                              className: 'bg-light-secondary dark:bg-dark-secondary px-1.5 py-0.5 rounded text-sm font-mono',
                            },
                          },
                          pre: {
                            component: 'pre',
                            props: {
                              className: 'bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg overflow-x-auto mb-4',
                            },
                          },
                          a: {
                            component: 'a',
                            props: {
                              className: 'text-blue-600 dark:text-blue-400 hover:underline',
                            },
                          },
                        },
                      }}
                    >
                      {parsedMessage}
                    </Markdown>

                    {/* Text selection reply */}
                    <TextSelectionReply
                      section={section}
                      setReplyingTo={setReplyingTo}
                      containerRef={answerContainerRef}
                    />

                    {/* Message Actions */}
                    {loading && isLast ? null : (
                      <div className="flex flex-row items-center space-x-2 -ml-2 mt-4">
                        <Copy section={section} initialMessage={parsedMessage} />
                        {speechMessage.length > 0 && (
                          <button
                            onClick={() => {
                              if (speechStatus === 'started') {
                                stop();
                              } else {
                                start();
                              }
                            }}
                            className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
                          >
                            {speechStatus === 'started' ? (
                              <StopCircle size={18} />
                            ) : (
                              <Volume2 size={18} />
                            )}
                          </button>
                        )}
                        <Like messageId={section.userMessage?.messageId || ''} chatId={section.userMessage?.chatId || ''} />
                        <Rewrite
                          rewrite={() => rewrite(section.userMessage?.messageId || '')}
                          messageId={section.userMessage?.messageId || ''}
                        />
                        <Reply section={section} setReplyingTo={() => setReplyingTo(section)} />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {section.assistantMessage?.content?.startsWith('Error:') && (
              <div className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {section.assistantMessage.content}
                </p>
              </div>
            )}
          </div>

          {/* Related queries */}
          {section.suggestions && section.suggestions.length > 0 && (
            <div className="lg:sticky lg:top-20 w-full lg:w-[300px] z-30 h-full lg:h-fit">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <Plus className="text-black dark:text-white" size={20} />
                  <h3 className="text-black dark:text-white font-medium text-xl">
                    Related Questions
                  </h3>
                </div>
                <div className="flex flex-col space-y-2">
                  {section.suggestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(question)}
                      className="text-left p-3 rounded-lg bg-light-secondary dark:bg-dark-secondary hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black dark:text-white"
                    >
                      <div className="flex flex-row items-center space-x-2">
                        <Plus size={16} />
                        <span className="text-sm">{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageSection;





