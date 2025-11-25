'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAllChats, getDB } from '@/lib/db/indexeddb';
import { Trash2, Database } from 'lucide-react';

export function StorageLimits() {
  const [storageUsage, setStorageUsage] = useState<{
    used: number;
    quota: number;
    percentage: number;
  } | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [isPersisted, setIsPersisted] = useState(false);

  useEffect(() => {
    checkStorage();
    checkChatCount();
    checkPersistence();
  }, []);

  const checkStorage = async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        setStorageUsage({
          used,
          quota,
          percentage,
        });
      }
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  };

  const checkChatCount = async () => {
    try {
      const chats = await getAllChats();
      setChatCount(chats.length);
    } catch (error) {
      console.error('Error checking chat count:', error);
    }
  };

  const checkPersistence = async () => {
    try {
      if (navigator.storage && navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        setIsPersisted(persisted);
      }
    } catch (error) {
      console.error('Error checking persistence:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteHistory = async () => {
    if (!confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      return;
    }

    try {
      const db = await getDB();
      const transaction = db.transaction(['chats', 'messages'], 'readwrite');
      
      await Promise.all([
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('chats').clear();
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('messages').clear();
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        }),
      ]);

      toast.success('Chat history deleted successfully');
      setChatCount(0);
      checkStorage();
      
      // Reload page to reset state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting history:', error);
      toast.error('Failed to delete chat history: ' + error.message);
    }
  };

  const handlePersistStorage = async () => {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const persisted = await navigator.storage.persist();
        setIsPersisted(persisted);
        
        if (persisted) {
          toast.success('Storage persisted successfully');
        } else {
          toast.warning('Storage persistence request denied. Your browser may still clear data when storage is low.');
        }
      } else {
        toast.error('Storage persistence is not supported in this browser');
      }
    } catch (error: any) {
      console.error('Error persisting storage:', error);
      toast.error('Failed to persist storage: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} />
          Storage & Limits
        </h3>
        <p className="text-sm text-black/70 dark:text-white/70 mb-4">
          Manage your local chat history storage
        </p>
      </div>

      {/* Chat Data */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">Local Storage</p>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                {chatCount} chat{chatCount !== 1 ? 's' : ''} stored locally
              </p>
            </div>
            {storageUsage && (
              <div className="text-right">
                <p className="text-sm font-medium">
                  {storageUsage.percentage.toFixed(2)}% of {formatBytes(storageUsage.quota)}
                </p>
                <p className="text-xs text-black/60 dark:text-white/60">
                  {formatBytes(storageUsage.used)} used
                </p>
              </div>
            )}
          </div>
          {storageUsage && (
            <div className="w-full bg-light-200 dark:bg-dark-200 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Delete Chat History */}
        <div className="border border-light-200 dark:border-dark-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Delete Chat History</p>
              <p className="text-xs text-black/60 dark:text-white/60">
                Think AI doesn't store (and can't access) your chat history. Instead, it is stored locally in your browser using IndexedDB, and you can delete it here.
              </p>
            </div>
            <button
              onClick={handleDeleteHistory}
              disabled={chatCount === 0}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Persist Storage */}
        <div className="border border-light-200 dark:border-dark-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Chat Persistence</p>
              <p className="text-xs text-black/60 dark:text-white/60">
                {isPersisted
                  ? 'Your chat history is safely persisted and will not be cleared by the browser.'
                  : 'Currently, your browser may clear chat history if storage space is needed. Enable persistence to keep your chat history safely stored.'}
              </p>
            </div>
            {!isPersisted && (
              <button
                onClick={handlePersistStorage}
                className="px-4 py-2 bg-light-secondary hover:bg-light-200 dark:bg-dark-secondary dark:hover:bg-dark-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Persist Storage
              </button>
            )}
            {isPersisted && (
              <div className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium whitespace-nowrap">
                ✓ Persisted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

