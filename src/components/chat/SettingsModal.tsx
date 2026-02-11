import { useState, useEffect } from 'react';
import { Settings, X, Save, Loader2, Brain, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUserSettings } from '@/hooks/useUserSettings';
import { cn } from '@/lib/utils';

export function SettingsModal() {
  const { settings, isLoading, isSaving, updateSettings } = useUserSettings();
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setInstructions(settings.custom_instructions || '');
      setMemoryEnabled(settings.memory_enabled);
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      const instructionsChanged = instructions !== (settings.custom_instructions || '');
      const memoryChanged = memoryEnabled !== settings.memory_enabled;
      setHasChanges(instructionsChanged || memoryChanged);
    }
  }, [instructions, memoryEnabled, settings]);

  const handleSave = async () => {
    const success = await updateSettings({
      custom_instructions: instructions,
      memory_enabled: memoryEnabled,
    });
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground glass-button"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-rounded text-lg">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Settings
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Custom Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <label className="text-sm font-rounded font-semibold">
                  Custom Instructions
                </label>
              </div>
              <p className="text-xs text-muted-foreground font-rounded">
                Tell the AI how you'd like it to respond. These instructions will be applied to all your conversations.
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Always respond in a formal tone. Explain concepts as if I'm a beginner. Use bullet points for lists..."
                className="w-full h-32 bg-background/50 border border-white/10 rounded-xl p-3 text-sm font-rounded resize-none outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground font-rounded text-right">
                {instructions.length} / 2000 characters
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-white/5">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-accent" />
                <div className="space-y-1">
                  <label className="text-sm font-rounded font-semibold">
                    Dark Mode
                  </label>
                  <p className="text-xs text-muted-foreground font-rounded">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={document.documentElement.classList.contains('dark')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                  }
                }}
              />
            </div>

            {/* Memory Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-white/5">
              <div className="space-y-1">
                <label className="text-sm font-rounded font-semibold">
                  Conversation Memory
                </label>
                <p className="text-xs text-muted-foreground font-rounded">
                  The AI will remember context within each conversation
                </p>
              </div>
              <Switch
                checked={memoryEnabled}
                onCheckedChange={setMemoryEnabled}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                "w-full h-11 rounded-xl font-rounded font-semibold transition-all duration-300",
                hasChanges
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
