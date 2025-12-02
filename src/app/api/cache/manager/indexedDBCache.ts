import { v4 as uuidv4 } from "uuid";
import { AssistantMessage, ThreadMessage, UserMessage } from "../types";
import { ICacheManager } from "./interface";

const THREAD_TTL_SECONDS = 3600; // 1 hour
const DB_NAME = "thread-cache-db";
const DB_VERSION = 1;
const STORE_NAME = "threads";

interface CachedThread {
  threadId: string;
  messages: ThreadMessage[];
  expiresAt: number;
}

// Initialize IndexedDB
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "threadId" });
        store.createIndex("expiresAt", "expiresAt", { unique: false });
      }
    };
  });
};

// Clean up expired threads
const cleanupExpiredThreads = async (): Promise<void> => {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("expiresAt");
    const now = Date.now();

    const request = index.openCursor(IDBKeyRange.upperBound(now));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch (error) {
    console.error("Error cleaning up expired threads:", error);
  }
};

export class IndexedDBCacheManager implements ICacheManager {
  constructor() {
    // Clean up expired threads on initialization
    cleanupExpiredThreads();
  }

  getThread = async (threadId: string): Promise<ThreadMessage[] | null> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(threadId);

        request.onsuccess = () => {
          const cached: CachedThread | undefined = request.result;
          if (!cached) {
            resolve(null);
            return;
          }

          // Check if expired
          if (cached.expiresAt < Date.now()) {
            // Delete expired thread
            const deleteTransaction = db.transaction([STORE_NAME], "readwrite");
            const deleteStore = deleteTransaction.objectStore(STORE_NAME);
            deleteStore.delete(threadId);
            resolve(null);
            return;
          }

          resolve(cached.messages);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error getting thread from cache:", error);
      return null;
    }
  };

  private saveThread = async (
    threadId: string,
    thread: ThreadMessage[],
  ): Promise<void> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const cached: CachedThread = {
          threadId,
          messages: thread,
          expiresAt: Date.now() + THREAD_TTL_SECONDS * 1000,
        };
        const request = store.put(cached);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error saving thread to cache:", error);
    }
  };

  addUserMessage = async (
    threadId: string,
    prompt: string,
  ): Promise<UserMessage> => {
    const thread = (await this.getThread(threadId)) || [];
    const userMessage: UserMessage = {
      role: "user",
      messageId: uuidv4(),
      prompt,
      timestamp: new Date().toISOString(),
    };
    const updatedThread = [...thread, userMessage];
    await this.saveThread(threadId, updatedThread);
    return userMessage;
  };

  addAssistantMessage = async (
    threadId: string,
    initialData?: Partial<
      Omit<AssistantMessage, "role" | "messageId" | "timestamp">
    >,
  ): Promise<AssistantMessage> => {
    const thread = (await this.getThread(threadId)) || [];
    const assistantMessage: AssistantMessage = {
      role: "assistant",
      messageId: uuidv4(),
      timestamp: new Date().toISOString(),
      ...initialData,
    };
    const updatedThread = [...thread, assistantMessage];
    await this.saveThread(threadId, updatedThread);
    return assistantMessage;
  };

  updateAssistantMessage = async (
    threadId: string,
    messageId: string,
    updates: Partial<
      Omit<AssistantMessage, "role" | "messageId" | "timestamp">
    >,
  ): Promise<void> => {
    const thread = await this.getThread(threadId);
    if (!thread) {
      return;
    }

    const messageIndex = thread.findIndex(
      (msg) => msg.messageId === messageId && msg.role === "assistant",
    );

    if (messageIndex === -1) {
      return;
    }

    const updatedMessage = { ...thread[messageIndex], ...updates };
    thread[messageIndex] = updatedMessage;

    await this.saveThread(threadId, thread);
  };
}

