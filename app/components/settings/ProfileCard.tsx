import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import { ExitIcon, ExternalLinkIcon, PersonIcon } from '@radix-ui/react-icons';
import { LoadingTransition } from '@ui/Loading';
import { useAuth } from '@workos-inc/authkit-react';

export function ProfileCard() {
  const profile = useStore(profileStore);
  const { signOut } = useAuth();
  const handleLogout = () => {
    signOut({ returnTo: window.location.origin });
  };

  return (
    <LoadingTransition loadingProps={{ className: 'h-[12.375rem]' }}>
      {profile && (
        <div className="w-full rounded-lg border bg-bolt-elements-background-depth-1 shadow-sm transition-all hover:shadow-md">
          <div className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-content-primary">Profile</h2>
            <div className="flex items-center gap-5">
              <div className="size-20 min-w-20 overflow-hidden rounded-full bg-gray-100 shadow-sm ring-2 ring-border-primary dark:bg-gray-700">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile?.username || 'User'} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <PersonIcon className="size-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-content-primary">{profile.username}</h3>
                {profile.email && <p className="mt-0.5 text-sm text-content-secondary">{profile.email}</p>}
                <div className="mt-3 flex flex-col gap-2.5">
                  <a
                    href="https://dashboard.convex.dev/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-content-link transition-colors hover:text-content-link/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-util-accent"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    Manage profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 bg-transparent text-sm font-medium text-content-warning transition-colors hover:text-content-warning/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-util-accent"
                  >
                    <ExitIcon className="size-3.5" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadingTransition>
  );
}
