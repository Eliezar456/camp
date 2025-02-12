import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Document } from '../types';

interface DocumentState {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: number) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (document) => set((state) => ({
        documents: [
          {
            ...document,
            id: Date.now(),
            uploadDate: new Date().toISOString(),
          },
          ...state.documents,
        ],
      })),
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      })),
    }),
    {
      name: 'documents-storage',
    }
  )
);