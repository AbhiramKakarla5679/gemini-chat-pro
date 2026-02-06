import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id: string;
  user_id: string;
  custom_instructions: string;
  memory_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as UserSettings);
      } else {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings as UserSettings);
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<Pick<UserSettings, 'custom_instructions' | 'memory_enabled'>>) => {
    if (!user || !settings) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, settings]);

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    refreshSettings: loadSettings,
  };
}
