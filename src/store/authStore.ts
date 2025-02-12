import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentLeader: string | null;
  login: (leaderName: string) => Promise<boolean>;
  adminLogin: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  currentLeader: null,
  login: async (leaderName) => {
    try {
      const email = `${leaderName.toLowerCase().replace(/\s+/g, '.')}@camp.local`;
      
      // First check if the user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('leaders')
        .select('name')
        .eq('name', leaderName)
        .single();

      if (checkError || !existingUser) {
        console.error('Leader not found:', leaderName);
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'camp123'
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        set({ 
          isAuthenticated: true, 
          isAdmin: false, 
          currentLeader: leaderName 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  adminLogin: async (password) => {
    if (password !== 'admin') {
      return false;
    }

    try {
      // First check if admin exists
      const { data: adminUser, error: checkError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', 'admin@camp.local')
        .single();

      if (checkError) {
        console.error('Admin user check error:', checkError);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@camp.local',
        password: 'admin123'
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      if (data.user) {
        const session = await supabase.auth.getSession();
        const metadata = session.data.session?.user.app_metadata;
        const isAdmin = metadata?.is_admin === true;

        if (!isAdmin) {
          console.error('User is not an admin');
          await supabase.auth.signOut();
          return false;
        }

        set({ 
          isAuthenticated: true, 
          isAdmin: true, 
          currentLeader: null 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  },
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ isAuthenticated: false, isAdmin: false, currentLeader: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));