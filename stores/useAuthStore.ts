import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, AuthUser, Profile, AccountType } from '@/types/database';

/**
 * Signup flow data - accumulated across multiple steps
 */
interface SignupFlowData {
  // Step 1: Account type selection
  accountType: AccountType | null;
  
  // Step 3: Business info (for trade accounts)
  businessName: string;
  businessAddress: string;
  contactPersonName: string;
  vatNumber: string;
  dealerLicense: string;
  businessLogoUri: string | null;
  profileBannerUri: string | null;
  
  // Step 4: Social links & credentials
  instagramLink: string;
  facebookLink: string;
  websiteLink: string;
  email: string;
  password: string;
}

/**
 * Auth store state interface
 */
interface AuthStoreState extends AuthState {
  // Signup flow state
  signupData: SignupFlowData;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthState['session']) => void;
  setProfile: (profile: Profile) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Signup flow actions
  setSignupAccountType: (accountType: AccountType) => void;
  setSignupBusinessInfo: (data: Partial<SignupFlowData>) => void;
  setSignupCredentials: (data: Partial<SignupFlowData>) => void;
  clearSignupData: () => void;
  
  // Session actions
  logout: () => void;
  clearAuth: () => void;
}

/**
 * Initial signup data state
 */
const initialSignupData: SignupFlowData = {
  accountType: null,
  businessName: '',
  businessAddress: '',
  contactPersonName: '',
  vatNumber: '',
  dealerLicense: '',
  businessLogoUri: null,
  profileBannerUri: null,
  instagramLink: '',
  facebookLink: '',
  websiteLink: '',
  email: '',
  password: '',
};

/**
 * Auth Store
 * 
 * Manages authentication state including:
 * - Current user and session
 * - Profile data
 * - Multi-step signup flow data
 * - Persistence across app restarts
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      signupData: initialSignupData,

      /**
       * Set the current authenticated user
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      /**
       * Set the auth session (tokens)
       */
      setSession: (session) => {
        set({
          session,
          isAuthenticated: !!session,
        });
      },

      /**
       * Update the user's profile data
       */
      setProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile,
            },
          });
        }
      },

      /**
       * Set loading state (e.g., during auth checks)
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set account type during signup flow (Step 1)
       */
      setSignupAccountType: (accountType) => {
        set((state) => ({
          signupData: {
            ...state.signupData,
            accountType,
          },
        }));
      },

      /**
       * Set business info during signup flow (Step 3)
       */
      setSignupBusinessInfo: (data) => {
        set((state) => ({
          signupData: {
            ...state.signupData,
            ...data,
          },
        }));
      },

      /**
       * Set credentials and social links during signup flow (Step 4)
       */
      setSignupCredentials: (data) => {
        set((state) => ({
          signupData: {
            ...state.signupData,
            ...data,
          },
        }));
      },

      /**
       * Clear signup flow data (after successful signup or cancellation)
       */
      clearSignupData: () => {
        set({ signupData: initialSignupData });
      },

      /**
       * Logout - clear user and session but keep persisted signup data
       */
      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      /**
       * Clear all auth state including signup data
       */
      clearAuth: () => {
        set({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          signupData: initialSignupData,
        });
      },
    }),
    {
      name: 'autocard-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields, not loading states
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        // Don't persist signupData or isLoading
      }),
    }
  )
);

/**
 * Selectors for common auth state queries
 */
export const selectIsAuthenticated = (state: AuthStoreState) => state.isAuthenticated;
export const selectUser = (state: AuthStoreState) => state.user;
export const selectProfile = (state: AuthStoreState) => state.user?.profile;
export const selectIsLoading = (state: AuthStoreState) => state.isLoading;
export const selectAccountType = (state: AuthStoreState) => state.user?.profile?.account_type;
export const selectIsTradeAccount = (state: AuthStoreState) => 
  state.user?.profile?.account_type === 'trade';
export const selectIsVerified = (state: AuthStoreState) => 
  state.user?.profile?.is_verified ?? false;
export const selectIsApproved = (state: AuthStoreState) => 
  state.user?.profile?.is_approved ?? false;
