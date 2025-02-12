import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Announcement } from '../types';

interface AnnouncementState {
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: number, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: number) => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      announcements: [],
      addAnnouncement: (announcement) => set((state) => ({
        announcements: [{ ...announcement, id: Date.now() }, ...state.announcements]
      })),
      updateAnnouncement: (id, updates) => set((state) => ({
        announcements: state.announcements.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      deleteAnnouncement: (id) => set((state) => ({
        announcements: state.announcements.filter(a => a.id !== id)
      }))
    }),
    {
      name: 'announcements-storage'
    }
  )
);