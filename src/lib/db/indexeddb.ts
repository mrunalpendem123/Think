// Browser-based IndexedDB storage for chat history

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  focusMode: string;
  files: Array<{ name: string; fileId: string }>;
}

interface Message {
  id?: number;
  role: 'assistant' | 'user' | 'source' | 'template' | 'suggestion';
  chatId: string;
  createdAt: string;
  messageId: string;
  content?: string | null;
  sources?: any[] | null;
  template?: string;
  data?: any;
}

const DB_NAME = 'perplexica-db';
const DB_VERSION = 1;
const CHATS_STORE = 'chats';
const MESSAGES_STORE = 'messages';

let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      // Try to delete and recreate if there's a version issue
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => {
        console.log('Database deleted, retrying...');
        // Retry opening
        const retryRequest = indexedDB.open(DB_NAME, DB_VERSION);
        retryRequest.onsuccess = () => {
          dbInstance = retryRequest.result;
          resolve(dbInstance);
        };
        retryRequest.onerror = () => {
          reject(new Error('Failed to open IndexedDB after retry'));
        };
        retryRequest.onupgradeneeded = createStores;
      };
      deleteRequest.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = createStores;
  });
};

function createStores(event: IDBVersionChangeEvent) {
  const db = (event.target as IDBOpenDBRequest).result;

  // Create chats store
  if (!db.objectStoreNames.contains(CHATS_STORE)) {
    const chatsStore = db.createObjectStore(CHATS_STORE, { keyPath: 'id' });
    chatsStore.createIndex('createdAt', 'createdAt', { unique: false });
  }

  // Create messages store
  if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
    const messagesStore = db.createObjectStore(MESSAGES_STORE, {
      keyPath: 'id',
      autoIncrement: true,
    });
    messagesStore.createIndex('chatId', 'chatId', { unique: false });
    messagesStore.createIndex('messageId', 'messageId', { unique: true });
    messagesStore.createIndex('createdAt', 'createdAt', { unique: false });
  }
}

export const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }
  return await initDB();
};

// Chat operations
export const saveChat = async (chat: Chat): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHATS_STORE], 'readwrite');
    const store = transaction.objectStore(CHATS_STORE);
    const request = store.put(chat);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHATS_STORE], 'readonly');
    const store = transaction.objectStore(CHATS_STORE);
    const request = store.get(chatId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllChats = async (): Promise<Chat[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHATS_STORE], 'readonly');
    const store = transaction.objectStore(CHATS_STORE);
    const index = store.index('createdAt');
    const request = index.getAll();

    request.onsuccess = () => {
      const chats = request.result || [];
      // Sort by createdAt descending (newest first)
      chats.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      resolve(chats);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHATS_STORE, MESSAGES_STORE], 'readwrite');
    
    // Delete messages first
    const messagesStore = transaction.objectStore(MESSAGES_STORE);
    const messagesIndex = messagesStore.index('chatId');
    const messagesRequest = messagesIndex.openCursor(IDBKeyRange.only(chatId));

    messagesRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        // All messages deleted, now delete chat
        const chatsStore = transaction.objectStore(CHATS_STORE);
        const chatRequest = chatsStore.delete(chatId);
        
        chatRequest.onsuccess = () => resolve();
        chatRequest.onerror = () => reject(chatRequest.error);
      }
    };

    messagesRequest.onerror = () => reject(messagesRequest.error);
  });
};

// Message operations
export const saveMessage = async (message: Message | any): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(MESSAGES_STORE);
    
    // Convert createdAt Date to ISO string for storage
    // Handle both Date objects and ISO strings
    let createdAtString: string;
    if (message.createdAt instanceof Date) {
      createdAtString = message.createdAt.toISOString();
    } else if (typeof message.createdAt === 'string') {
      // Already a string, use it directly
      createdAtString = message.createdAt;
    } else {
      // Fallback to current time
      createdAtString = new Date().toISOString();
    }
    
    const messageToSave: any = {
      ...message,
      createdAt: createdAtString,
    };
    
    // Check if message with same messageId exists
    const index = store.index('messageId');
    const checkRequest = index.get(messageToSave.messageId);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        // Update existing message
        const updateRequest = store.put({
          ...checkRequest.result,
          ...messageToSave,
        });
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        // Add new message
        const addRequest = store.add(messageToSave);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      }
    };

    checkRequest.onerror = () => reject(checkRequest.error);
  });
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readonly');
    const store = transaction.objectStore(MESSAGES_STORE);
    const index = store.index('chatId');
    const request = index.getAll(chatId);

    request.onsuccess = () => {
      const messages = request.result || [];
      // Sort by createdAt ascending (oldest first)
      messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      resolve(messages);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteMessagesAfter = async (
  chatId: string,
  messageId: string,
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
    const store = transaction.objectStore(MESSAGES_STORE);
    const index = store.index('messageId');
    
    // Find the message to delete from
    const findRequest = index.get(messageId);
    
    findRequest.onsuccess = () => {
      const targetMessage = findRequest.result;
      if (!targetMessage) {
        resolve();
        return;
      }

      // Get all messages for this chat
      const chatIndex = store.index('chatId');
      const getAllRequest = chatIndex.getAll(chatId);

      getAllRequest.onsuccess = () => {
        const messages = getAllRequest.result || [];
        const targetTime = new Date(targetMessage.createdAt).getTime();

        // Delete messages created after the target message
        let deleted = 0;
        let toDelete = messages.filter(
          (msg) => new Date(msg.createdAt).getTime() > targetTime,
        );

        if (toDelete.length === 0) {
          resolve();
          return;
        }

        toDelete.forEach((msg) => {
          const deleteRequest = store.delete(msg.id!);
          deleteRequest.onsuccess = () => {
            deleted++;
            if (deleted === toDelete.length) {
              resolve();
            }
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    findRequest.onerror = () => reject(findRequest.error);
  });
};

