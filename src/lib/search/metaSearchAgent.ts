import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from '@langchain/core/prompts';
import {
  RunnableLambda,
  RunnableMap,
  RunnableSequence,
} from '@langchain/core/runnables';
import { BaseMessage, BaseMessageLike } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import LineListOutputParser from '../outputParsers/listLineOutputParser';
import LineOutputParser from '../outputParsers/lineOutputParser';
import { getDocumentsFromLinks } from '../utils/documents';
import { Document } from '@langchain/core/documents';
import { searchParallel } from '../parallel';
import { searchBrightData } from '../brightdata';
import { getBrightDataAPIKey } from '../config/serverRegistry';
import path from 'node:path';
import fs from 'node:fs';
import computeSimilarity from '../utils/computeSimilarity';
import formatChatHistoryAsString from '../utils/formatHistory';
import eventEmitter from 'events';
import { StreamEvent } from '@langchain/core/tracers/log_stream';
import { isImageFile, getImagePath } from '../utils/files';

export interface MetaSearchAgentType {
  searchAndAnswer: (
    message: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    fileIds: string[],
    systemInstructions: string,
  ) => Promise<eventEmitter>;
}

interface Config {
  searchWeb: boolean;
  rerank: boolean;
  rerankThreshold: number;
  queryGeneratorPrompt: string;
  queryGeneratorFewShots: BaseMessageLike[];
  responsePrompt: string;
  activeEngines: string[];
}

type BasicChainInput = {
  chat_history: BaseMessage[];
  query: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  systemInstructions?: string;
  context?: string;
  date?: string;
};

class MetaSearchAgent implements MetaSearchAgentType {
  private config: Config;
  private strParser = new StringOutputParser();

  constructor(config: Config) {
    this.config = config;
  }

  private async createSearchRetrieverChain(llm: BaseChatModel) {
    (llm as unknown as ChatOpenAI).temperature = 0;

    return RunnableSequence.from([
      ChatPromptTemplate.fromMessages([
        ['system', this.config.queryGeneratorPrompt],
        ...this.config.queryGeneratorFewShots,
        [
          'user',
          `
        <conversation>
        {chat_history}
        </conversation>

        <query>
        {query}
        </query>
       `,
        ],
      ]),
      llm,
      this.strParser,
      RunnableLambda.from(async (input: string) => {
        const linksOutputParser = new LineListOutputParser({
          key: 'links',
        });

        const questionOutputParser = new LineOutputParser({
          key: 'question',
        });

        const links = await linksOutputParser.parse(input);
        let question = (await questionOutputParser.parse(input)) ?? input;

        if (question === 'not_needed') {
          return { query: '', docs: [] };
        }

        if (links.length > 0) {
          if (question.length === 0) {
            question = 'summarize';
          }

          let docs: Document[] = [];

          const linkDocs = await getDocumentsFromLinks({ links });

          const docGroups: Document[] = [];

          linkDocs.map((doc) => {
            const URLDocExists = docGroups.find(
              (d) =>
                d.metadata.url === doc.metadata.url &&
                d.metadata.totalDocs < 10,
            );

            if (!URLDocExists) {
              docGroups.push({
                ...doc,
                metadata: {
                  ...doc.metadata,
                  totalDocs: 1,
                },
              });
            }

            const docIndex = docGroups.findIndex(
              (d) =>
                d.metadata.url === doc.metadata.url &&
                d.metadata.totalDocs < 10,
            );

            if (docIndex !== -1) {
              docGroups[docIndex].pageContent =
                docGroups[docIndex].pageContent + `\n\n` + doc.pageContent;
              docGroups[docIndex].metadata.totalDocs += 1;
            }
          });

          await Promise.all(
            docGroups.map(async (doc) => {
              const res = await llm.invoke(`
            You are a web search summarizer, tasked with summarizing a piece of text retrieved from a web search. Your job is to summarize the 
            text into a detailed, 2-4 paragraph explanation that captures the main ideas and provides a comprehensive answer to the query.
            If the query is \"summarize\", you should provide a detailed summary of the text. If the query is a specific question, you should answer it in the summary.
            
            - **Journalistic tone**: The summary should sound professional and journalistic, not too casual or vague.
            - **Thorough and detailed**: Ensure that every key point from the text is captured and that the summary directly answers the query.
            - **Not too lengthy, but detailed**: The summary should be informative but not excessively long. Focus on providing detailed information in a concise format.

            The text will be shared inside the \`text\` XML tag, and the query inside the \`query\` XML tag.

            <example>
            1. \`<text>
            Docker is a set of platform-as-a-service products that use OS-level virtualization to deliver software in packages called containers. 
            It was first released in 2013 and is developed by Docker, Inc. Docker is designed to make it easier to create, deploy, and run applications 
            by using containers.
            </text>

            <query>
            What is Docker and how does it work?
            </query>

            Response:
            Docker is a revolutionary platform-as-a-service product developed by Docker, Inc., that uses container technology to make application 
            deployment more efficient. It allows developers to package their software with all necessary dependencies, making it easier to run in 
            any environment. Released in 2013, Docker has transformed the way applications are built, deployed, and managed.
            \`
            2. \`<text>
            The theory of relativity, or simply relativity, encompasses two interrelated theories of Albert Einstein: special relativity and general
            relativity. However, the word "relativity" is sometimes used in reference to Galilean invariance. The term "theory of relativity" was based
            on the expression "relative theory" used by Max Planck in 1906. The theory of relativity usually encompasses two interrelated theories by
            Albert Einstein: special relativity and general relativity. Special relativity applies to all physical phenomena in the absence of gravity.
            General relativity explains the law of gravitation and its relation to other forces of nature. It applies to the cosmological and astrophysical
            realm, including astronomy.
            </text>

            <query>
            summarize
            </query>

            Response:
            The theory of relativity, developed by Albert Einstein, encompasses two main theories: special relativity and general relativity. Special
            relativity applies to all physical phenomena in the absence of gravity, while general relativity explains the law of gravitation and its
            relation to other forces of nature. The theory of relativity is based on the concept of "relative theory," as introduced by Max Planck in
            1906. It is a fundamental theory in physics that has revolutionized our understanding of the universe.
            \`
            </example>

            Everything below is the actual data you will be working with. Good luck!

            <query>
            ${question}
            </query>

            <text>
            ${doc.pageContent}
            </text>

            Make sure to answer the query in the summary.
          `);

              const document = new Document({
                pageContent: res.content as string,
                metadata: {
                  title: doc.metadata.title,
                  url: doc.metadata.url,
                },
              });

              docs.push(document);
            }),
          );

          return { query: question, docs: docs };
        } else {
          question = question.replace(/<think>.*?<\/think>/g, '');

          // Try BrightData if configured, fallback to Parallel AI on error
          const brightDataKey = getBrightDataAPIKey();
          let res;
          
          if (brightDataKey) {
            try {
              res = await searchBrightData(question, 20);
            } catch (error: any) {
              console.warn('BrightData search failed, falling back to Parallel AI:', error.message);
              res = await searchParallel(question, 20);
            }
          } else {
            res = await searchParallel(question, 20);
          }

          const documents = res.results.map(
            (result) =>
              new Document({
                pageContent: result.content || '',
                metadata: {
                  title: result.title,
                  url: result.url,
                },
              }),
          );

          return { query: question, docs: documents };
        }
      }),
    ]);
  }

  private async createAnsweringChain(
    llm: BaseChatModel,
    fileIds: string[],
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    systemInstructions: string,
  ) {
    return RunnableSequence.from([
      RunnableMap.from({
        systemInstructions: () => systemInstructions || '',
        query: (input: BasicChainInput) => input.query,
        chat_history: (input: BasicChainInput) => input.chat_history,
        date: () => new Date().toISOString(),
        context: RunnableLambda.from(async (input: BasicChainInput) => {
          const processedHistory = formatChatHistoryAsString(
            input.chat_history,
          );

          let docs: Document[] | null = null;
          // Extract text from query if it's an array (vision format)
          let query = typeof input.query === 'string' ? input.query : 
            (input.query.find((item) => item.type === 'text')?.text || '');

          if (this.config.searchWeb) {
            const searchRetrieverChain =
              await this.createSearchRetrieverChain(llm);

            const searchRetrieverResult = await searchRetrieverChain.invoke({
              chat_history: processedHistory,
              query,
            });

            query = searchRetrieverResult.query;
            docs = searchRetrieverResult.docs;
          }

          const sortedDocs = await this.rerankDocs(
            query,
            docs ?? [],
            fileIds,
            embeddings,
            optimizationMode,
          );

          return sortedDocs;
        })
          .withConfig({
            runName: 'FinalSourceRetriever',
          })
          .pipe(this.processDocs),
      }),
      RunnableLambda.from(async (input: BasicChainInput) => {
        // Handle vision messages (array content) vs text messages (string)
        if (Array.isArray(input.query)) {
          // For vision models, create messages with vision content
          const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');
          // Replace template variables in the prompt for vision models
          let systemPrompt = this.config.responsePrompt
            .replace('{systemInstructions}', input.systemInstructions || '')
            .replace('{context}', input.context || '')
            .replace('{date}', input.date || new Date().toISOString());
          const systemMessage = new SystemMessage(systemPrompt);
          const visionMessage = new HumanMessage({
            content: input.query,
          });
          const messages = [
            systemMessage,
            ...input.chat_history,
            visionMessage,
          ];
          return messages;
        } else {
          // For text-only messages, use the template
          const template = ChatPromptTemplate.fromMessages([
            ['system', this.config.responsePrompt],
            new MessagesPlaceholder('chat_history'),
            ['user', '{query}'],
          ]);
          const prompt = await template.invoke({
            chat_history: input.chat_history,
            query: input.query,
            systemInstructions: input.systemInstructions || '',
            context: input.context || '',
            date: input.date || new Date().toISOString(),
          });
          // Convert ChatPromptValue to messages array
          const messages = prompt.toChatMessages();
          return messages;
        }
      }),
      llm,
      this.strParser,
    ]).withConfig({
      runName: 'FinalResponseGenerator',
    });
  }

  private async rerankDocs(
    query: string,
    docs: Document[],
    fileIds: string[],
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
  ) {
    if (docs.length === 0 && fileIds.length === 0) {
      return docs;
    }

    // Filter out image files - they don't have embeddings and are handled separately
    const documentFileIds = fileIds.filter((fileId) => !isImageFile(fileId));

    const filesData = documentFileIds
      .map((file) => {
        const filePath = path.join(process.cwd(), 'uploads', file);

        const contentPath = filePath + '-extracted.json';
        const embeddingsPath = filePath + '-embeddings.json';

        // Skip if files don't exist
        if (!fs.existsSync(contentPath) || !fs.existsSync(embeddingsPath)) {
          return null;
        }

        const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));

        const fileSimilaritySearchObject = content.contents.map(
          (c: string, i: number) => {
            return {
              fileName: content.title,
              content: c,
              embeddings: embeddings.embeddings[i],
            };
          },
        );

        return fileSimilaritySearchObject;
      })
      .filter((item) => item !== null)
      .flat() as Array<{ fileName: string; content: string; embeddings: number[] }>;

    if (query.toLocaleLowerCase() === 'summarize') {
      return docs.slice(0, 15);
    }

    const docsWithContent = docs.filter(
      (doc) => doc.pageContent && doc.pageContent.length > 0,
    );

    if (optimizationMode === 'speed' || this.config.rerank === false) {
      if (filesData.length > 0) {
        const [queryEmbedding] = await Promise.all([
          embeddings.embedQuery(query),
        ]);

        const fileDocs = filesData.map((fileData) => {
          return new Document({
            pageContent: fileData.content,
            metadata: {
              title: fileData.fileName,
              url: `File`,
            },
          });
        });

        const similarity = filesData.map((fileData, i) => {
          const sim = computeSimilarity(queryEmbedding, fileData.embeddings);

          return {
            index: i,
            similarity: sim,
          };
        });

        let sortedDocs = similarity
          .filter(
            (sim) => sim.similarity > (this.config.rerankThreshold ?? 0.3),
          )
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 15)
          .map((sim) => fileDocs[sim.index]);

        sortedDocs =
          docsWithContent.length > 0 ? sortedDocs.slice(0, 8) : sortedDocs;

        return [
          ...sortedDocs,
          ...docsWithContent.slice(0, 15 - sortedDocs.length),
        ];
      } else {
        return docsWithContent.slice(0, 15);
      }
    } else if (optimizationMode === 'balanced') {
      const [docEmbeddings, queryEmbedding] = await Promise.all([
        embeddings.embedDocuments(
          docsWithContent.map((doc) => doc.pageContent),
        ),
        embeddings.embedQuery(query),
      ]);

      docsWithContent.push(
        ...filesData.map((fileData) => {
          return new Document({
            pageContent: fileData.content,
            metadata: {
              title: fileData.fileName,
              url: `File`,
            },
          });
        }),
      );

      docEmbeddings.push(...filesData.map((fileData) => fileData.embeddings));

      const similarity = docEmbeddings.map((docEmbedding, i) => {
        const sim = computeSimilarity(queryEmbedding, docEmbedding);

        return {
          index: i,
          similarity: sim,
        };
      });

      const sortedDocs = similarity
        .filter((sim) => sim.similarity > (this.config.rerankThreshold ?? 0.3))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 15)
        .map((sim) => docsWithContent[sim.index]);

      return sortedDocs;
    }

    return [];
  }

  private processDocs(docs: Document[]) {
    return docs
      .map((doc, index) => {
        const url = doc.metadata?.url || '';
        const title = doc.metadata?.title || '';
        
        // Format with clear URL information so AI can extract and use it
        let formatted = `${index + 1}. `;
        if (title) {
          formatted += `Title: ${title}\n`;
        }
        if (url) {
          formatted += `URL: ${url}\n`;
        }
        formatted += `Content: ${doc.pageContent}`;
        
        return formatted;
      })
      .join('\n\n');
  }

  private async handleStream(
    stream: AsyncGenerator<StreamEvent, any, any>,
    emitter: eventEmitter,
  ) {
    try {
      for await (const event of stream) {
        if (
          event.event === 'on_chain_end' &&
          event.name === 'FinalSourceRetriever'
        ) {
          emitter.emit(
            'data',
            JSON.stringify({ type: 'sources', data: event.data.output }),
          );
        }
        if (
          event.event === 'on_chain_stream' &&
          event.name === 'FinalResponseGenerator'
        ) {
          emitter.emit(
            'data',
            JSON.stringify({ type: 'response', data: event.data.chunk }),
          );
        }
        if (
          event.event === 'on_chain_end' &&
          event.name === 'FinalResponseGenerator'
        ) {
          emitter.emit('end');
        }
      }
    } catch (error) {
      console.error('Error in handleStream:', error);
      emitter.emit(
        'error',
        error instanceof Error ? error : new Error('Stream processing error'),
      );
    }
  }

  private async prepareMessageWithImages(
    message: string,
    fileIds: string[],
  ): Promise<string | Array<{ type: string; text?: string; image_url?: { url: string } }>> {
    const imageFileIds = fileIds.filter((fileId) => isImageFile(fileId));
    
    if (imageFileIds.length === 0) {
      return message;
    }

    // Convert images to base64 data URLs
    const imageContents = await Promise.all(
      imageFileIds.map(async (fileId) => {
        const imagePath = getImagePath(fileId);
        if (!imagePath) {
          return null;
        }

        const fullPath = path.join(process.cwd(), imagePath);
        if (!fs.existsSync(fullPath)) {
          return null;
        }

        const imageBuffer = fs.readFileSync(fullPath);
        const base64Image = imageBuffer.toString('base64');
        
        // Determine MIME type from file extension
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.bmp': 'image/bmp',
        };
        const mimeType = mimeTypes[ext] || 'image/png';
        
        return {
          type: 'image_url' as const,
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        };
      }),
    );

    const validImageContents = imageContents.filter(
      (item) => item !== null,
    ) as Array<{ type: string; image_url: { url: string } }>;

    if (validImageContents.length === 0) {
      return message;
    }

    // Return array format for vision models: [text, ...images]
    return [
      { type: 'text', text: message },
      ...validImageContents,
    ] as Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }

  async searchAndAnswer(
    message: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    fileIds: string[],
    systemInstructions: string,
  ) {
    const emitter = new eventEmitter();

    // Process stream asynchronously and handle errors
    // This ensures the function returns immediately while processing happens in background
    (async () => {
      try {
        // Prepare message with images if any
        const messageWithImages = await this.prepareMessageWithImages(message, fileIds);

        const answeringChain = await this.createAnsweringChain(
          llm,
          fileIds,
          embeddings,
          optimizationMode,
          systemInstructions,
        );

        const stream = answeringChain.streamEvents(
          {
            chat_history: history,
            query: messageWithImages,
          },
          {
            version: 'v1',
          },
        );

        await this.handleStream(stream, emitter);
      } catch (error) {
        console.error('Error in searchAndAnswer:', error);
        emitter.emit(
          'error',
          error instanceof Error ? error : new Error('Unknown error occurred'),
        );
      }
    })();

    return emitter;
  }
}

export default MetaSearchAgent;
