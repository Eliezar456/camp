import { create } from 'zustand';
import { Leader, Camper } from '../types';
import { supabase } from '../lib/supabase';

interface CampState {
  totalSpots: number;
  leaders: Leader[];
  campers: Camper[];
  setTotalSpots: (spots: number) => void;
  setLeaders: (leaders: Leader[]) => void;
  addLeader: (leader: Leader) => Promise<void>;
  updateLeader: (oldName: string, leader: Leader) => Promise<void>;
  deleteLeader: (name: string) => Promise<void>;
  addCamper: (camper: Omit<Camper, 'id' | 'sequentialNumber'>) => Promise<void>;
  updateCamper: (id: number, camper: Partial<Camper>) => Promise<void>;
  deleteCamper: (id: number) => Promise<void>;
  bulkDeleteCampers: (by?: 'leader' | 'institution', value?: string) => Promise<void>;
  updateLeaderSpots: () => void;
  initializeRealtimeSubscription: () => void;
}

export const useCampStore = create<CampState>((set, get) => {
  const updateLeaderSpots = () => {
    set((state) => {
      const camperCounts = state.campers.reduce((counts: {[key: string]: number}, camper) => {
        counts[camper.leader] = (counts[camper.leader] || 0) + 1;
        return counts;
      }, {});

      const updatedLeaders = state.leaders.map(leader => ({
        ...leader,
        usedSpots: camperCounts[leader.name] || 0
      }));

      return { leaders: updatedLeaders };
    });
  };

  const transformCamperFromDB = (dbCamper: any, leaders: Leader[]): Camper => {
    // Find the leader name from the leader_id
    const leader = leaders.find(l => l.id === dbCamper.leader_id);
    return {
      id: dbCamper.id,
      sequentialNumber: dbCamper.sequential_number,
      fullName: dbCamper.full_name,
      institution: dbCamper.institution,
      leader: leader?.name || '',
      birthDate: dbCamper.birth_date,
      age: dbCamper.age,
      gender: dbCamper.gender,
      phone: dbCamper.phone,
      address: dbCamper.address,
      department: dbCamper.department,
      guardianName: dbCamper.guardian_name,
      guardianPhone: dbCamper.guardian_phone
    };
  };

  const transformCamperToDB = async (camper: Partial<Camper>) => {
    // Find the leader_id from the leader name
    const { data: leaderData } = await supabase
      .from('leaders')
      .select('id')
      .eq('name', camper.leader)
      .single();

    // Ensure date is in correct format
    let birthDate = null;
    if (camper.birthDate) {
      try {
        const date = new Date(camper.birthDate);
        if (!isNaN(date.getTime())) {
          birthDate = camper.birthDate; // Already in YYYY-MM-DD format
        }
      } catch (e) {
        console.error('Invalid date format:', e);
      }
    }

    return {
      full_name: camper.fullName,
      institution: camper.institution,
      leader_id: leaderData?.id,
      birth_date: birthDate,
      age: camper.age,
      gender: camper.gender,
      phone: camper.phone,
      address: camper.address,
      department: camper.department,
      guardian_name: camper.guardianName,
      guardian_phone: camper.guardianPhone
    };
  };

  const initializeRealtimeSubscription = () => {
    // Subscribe to changes in the leaders table
    supabase
      .channel('leaders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaders' }, 
        async () => {
          const { data: leaders } = await supabase
            .from('leaders')
            .select('*')
            .order('name');
            
          if (leaders) {
            const transformedLeaders = leaders.map(leader => ({
              id: leader.id,
              name: leader.name,
              assignedSpots: leader.assigned_spots,
              usedSpots: leader.used_spots
            }));
            set({ leaders: transformedLeaders });
            updateLeaderSpots();
          }
      })
      .subscribe();

    // Initial fetch of leaders
    supabase
      .from('leaders')
      .select('*')
      .order('name')
      .then(({ data: leaders }) => {
        if (leaders) {
          const transformedLeaders = leaders.map(leader => ({
            id: leader.id,
            name: leader.name,
            assignedSpots: leader.assigned_spots,
            usedSpots: leader.used_spots
          }));
          set({ leaders: transformedLeaders });
          updateLeaderSpots();
        }
      });

    // Subscribe to changes in the campers table
    supabase
      .channel('campers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campers' }, 
        async () => {
          const { data: campers } = await supabase
            .from('campers')
            .select(`
              *,
              leaders (
                id,
                name
              )
            `);
          if (campers) {
            const transformedCampers = campers.map(c => transformCamperFromDB(c, get().leaders));
            set({ campers: transformedCampers });
            updateLeaderSpots();
          }
      })
      .subscribe();

    // Initial fetch of campers
    supabase
      .from('campers')
      .select(`
        *,
        leaders (
          id,
          name
        )
      `)
      .then(({ data: campers }) => {
        if (campers) {
          const transformedCampers = campers.map(c => transformCamperFromDB(c, get().leaders));
          set({ campers: transformedCampers });
          updateLeaderSpots();
        }
      });
  };

  return {
    totalSpots: 200,
    leaders: [],
    campers: [],
    setTotalSpots: (spots) => set({ totalSpots: spots }),
    setLeaders: (leaders) => {
      set({ leaders });
      updateLeaderSpots();
    },
    addLeader: async (leader) => {
      const { data, error } = await supabase
        .from('leaders')
        .insert([{ 
          name: leader.name,
          assigned_spots: leader.assignedSpots,
          used_spots: 0
        }])
        .select();
      
      if (error) {
        console.error('Error adding leader:', error);
        throw error;
      }
      
      if (data && data[0]) {
        const newLeader = {
          id: data[0].id,
          name: data[0].name,
          assignedSpots: data[0].assigned_spots,
          usedSpots: 0
        };
        set((state) => ({ 
          leaders: [...state.leaders, newLeader] 
        }));
        updateLeaderSpots();
      }
    },
    updateLeader: async (oldName, leader) => {
      const { data, error } = await supabase
        .from('leaders')
        .update({ 
          name: leader.name,
          assigned_spots: leader.assignedSpots
        })
        .eq('name', oldName)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        set((state) => ({
          leaders: state.leaders.map(l => l.name === oldName ? { 
            id: data[0].id,
            name: data[0].name,
            assignedSpots: data[0].assigned_spots,
            usedSpots: 0 
          } : l),
          campers: state.campers.map(c => c.leader === oldName ? { ...c, leader: leader.name } : c)
        }));
        updateLeaderSpots();
      }
    },
    deleteLeader: async (name) => {
      const { error } = await supabase
        .from('leaders')
        .delete()
        .eq('name', name);
      
      if (error) throw error;
      
      set((state) => ({
        leaders: state.leaders.filter(l => l.name !== name)
      }));
      updateLeaderSpots();
    },
    addCamper: async (camper) => {
      const { data: existingCampers } = await supabase
        .from('campers')
        .select('sequential_number')
        .order('sequential_number', { ascending: false })
        .limit(1);

      const newSequentialNumber = existingCampers && existingCampers.length > 0
        ? existingCampers[0].sequential_number + 1
        : 1;

      const dbCamper = await transformCamperToDB(camper);
      const { data, error } = await supabase
        .from('campers')
        .insert([{ 
          ...dbCamper, 
          sequential_number: newSequentialNumber 
        }])
        .select(`
          *,
          leaders (
            id,
            name
          )
        `);
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newCamper = transformCamperFromDB(data[0], get().leaders);
        set((state) => ({
          campers: [...state.campers, newCamper],
        }));
        updateLeaderSpots();
      }
    },
    updateCamper: async (id, updates) => {
      const dbUpdates = await transformCamperToDB(updates);
      const { data, error } = await supabase
        .from('campers')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          leaders (
            id,
            name
          )
        `);
      
      if (error) throw error;
      
      if (data && data[0]) {
        const updatedCamper = transformCamperFromDB(data[0], get().leaders);
        set((state) => ({
          campers: state.campers.map(c => c.id === id ? { ...c, ...updatedCamper } : c)
        }));
        updateLeaderSpots();
      }
    },
    deleteCamper: async (id) => {
      const { error } = await supabase
        .from('campers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        campers: state.campers.filter(c => c.id !== id),
      }));
      updateLeaderSpots();
    },
    bulkDeleteCampers: async (by?: 'leader' | 'institution', value?: string) => {
      if (!by) {
        const { error } = await supabase
          .from('campers')
          .delete()
          .neq('id', 0); // Delete all
        
        if (error) throw error;
        
        set({ campers: [] });
      } else {
        // If deleting by leader, we need to get the leader_id first
        let query = supabase.from('campers').delete();
        
        if (by === 'leader') {
          const { data: leaderData } = await supabase
            .from('leaders')
            .select('id')
            .eq('name', value)
            .single();
            
          if (leaderData) {
            query = query.eq('leader_id', leaderData.id);
          }
        } else {
          query = query.eq('institution', value);
        }
        
        const { error } = await query;
        if (error) throw error;
        
        set((state) => ({
          campers: state.campers.filter(camper => 
            by === 'leader' 
              ? camper.leader !== value
              : camper.institution !== value
          )
        }));
      }
      updateLeaderSpots();
    },
    updateLeaderSpots,
    initializeRealtimeSubscription
  };
});