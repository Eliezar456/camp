import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Decision = 'accepted' | 'reconciled';

export interface TrackingEntry {
  id: number;
  camperId: number;
  decision: Decision;
}

interface TrackingState {
  entries: TrackingEntry[];
  addEntry: (entry: Omit<TrackingEntry, 'id'>) => void;
  deleteEntry: (id: number) => void;
  deleteEntriesForCamper: (camperId: number) => void;
  deleteAllEntries: () => void;
  deleteEntriesByLeader: (leaderName: string) => void;
  deleteEntriesByInstitution: (institution: string) => void;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({
        entries: [
          { 
            ...entry, 
            id: Date.now()
          }, 
          ...state.entries
        ]
      })),
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(e => e.id !== id)
      })),
      deleteEntriesForCamper: (camperId) => set((state) => ({
        entries: state.entries.filter(e => e.camperId !== camperId)
      })),
      deleteAllEntries: () => set({ entries: [] }),
      deleteEntriesByLeader: (leaderName) => set((state) => ({
        entries: state.entries.filter(entry => {
          const camper = window.campStore.getState().campers.find(c => c.id === entry.camperId);
          return camper?.leader !== leaderName;
        })
      })),
      deleteEntriesByInstitution: (institution) => set((state) => ({
        entries: state.entries.filter(entry => {
          const camper = window.campStore.getState().campers.find(c => c.id === entry.camperId);
          return camper?.institution !== institution;
        })
      }))
    }),
    {
      name: 'tracking-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);