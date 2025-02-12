import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../types';

interface MessageState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id'>) => void;
  deleteMessage: (id: number) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: Date.now() }]
      })),
      deleteMessage: (id) => set((state) => ({
        messages: state.messages.filter(m => m.id !== id)
      }))
    }),
    {
      name: 'messages-storage'
    }
  )
);