import { useStore } from '@nanostores/react';
import { Button } from '@ui/Button';
import { toggleTheme } from '~/lib/stores/theme';
import { themeStore } from '~/lib/stores/theme';

export function ThemeCard() {
  const theme = useStore(themeStore);
  return (
    <div className="rounded-lg border bg-bolt-elements-background-depth-1 shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-content-primary">Appearance</h2>
        <div className="flex items-center justify-between rounded-lg border bg-bolt-elements-background-depth-2 p-4">
          <div className="flex flex-col">
            <span className="font-medium text-content-primary">Theme</span>
            <span className="text-xs text-content-secondary">Choose your preferred color scheme</span>
          </div>

          <Button onClick={() => toggleTheme()}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>
      </div>
    </div>
  );
}
