import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { ApiKeyCard } from '~/components/settings/ApiKeyCard';
import { ThemeCard } from '~/components/settings/ThemeCard';
import { ProfileCard } from '~/components/settings/ProfileCard';
import { UsageCard } from '~/components/settings/UsageCard';
import { Toaster } from '~/components/ui/Toaster';
import { UserProvider } from '~/components/UserProvider';

export function SettingsContent() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-bolt-elements-background-depth-2">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-4">
            <a 
              href="/" 
              className="inline-flex items-center justify-center size-10 rounded-lg transition-colors hover:bg-bolt-elements-background-depth-1 focus-visible:ring-2 focus-visible:ring-util-accent" 
              title="Back to Chat"
              aria-label="Back to Chat"
            >
              <ArrowLeftIcon className="size-5" />
            </a>
            <h1 className="text-3xl font-bold text-content-primary tracking-tight">Settings</h1>
          </div>

          <div className="space-y-8">
            <ProfileCard />
            <UsageCard />
            <ApiKeyCard />
            <ThemeCard />
          </div>
        </div>
        <Toaster />
      </div>
    </UserProvider>
  );
}
