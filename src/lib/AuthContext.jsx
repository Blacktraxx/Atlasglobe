import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profiles } from '@/api/entities';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await Profiles.me();
      setUser(profile);
      setIsAuthenticated(!!profile);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Still authenticated with Supabase even if the profile row fetch failed.
      setIsAuthenticated(true);
    }
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await loadProfile();
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, [loadProfile]);

  useEffect(() => {
    checkUserAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
      setIsLoadingAuth(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [checkUserAuth, loadProfile]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
