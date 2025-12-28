import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { getStoredTeamSlug } from '~/lib/stores/convexTeams';
import { convexTeamsStore } from '~/lib/stores/convexTeams';
import { TeamSelector } from '~/components/convex/TeamSelector';
import { Callout } from '@ui/Callout';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Button } from '@ui/Button';
import { ProgressBar } from '@ui/ProgressBar';
import { useUsage } from '~/lib/stores/usage';
import { renderTokenCount } from '~/lib/convexUsage';

export function UsageCard() {
  const teams = useStore(convexTeamsStore);
  const [selectedTeamSlug, setSelectedTeamSlug] = useState(getStoredTeamSlug() ?? teams?.[0]?.slug ?? null);
  useEffect(() => {
    if (teams && !selectedTeamSlug) {
      setSelectedTeamSlug(teams[0]?.slug);
    }
    // No need to run if only `selectedTeamSlug` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const { isLoadingUsage, usagePercentage, used, quota, isPaidPlan } = useUsage({
    teamSlug: selectedTeamSlug,
  });

  return (
    <div className="rounded-lg border bg-bolt-elements-background-depth-1 shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-content-primary">Chef Usage</h2>
          <div className="ml-auto">
            <TeamSelector selectedTeamSlug={selectedTeamSlug} setSelectedTeamSlug={setSelectedTeamSlug} />
          </div>
        </div>
        
        <div className="mb-6 rounded-lg border bg-bolt-elements-background-depth-2 p-4">
          <p className="mb-2 text-sm font-medium text-content-primary">Your Convex team comes with tokens included for Chef.</p>
          <p className="mb-1 text-xs text-content-secondary">
            On paid Convex subscriptions, additional usage will be subject to metered billing.
          </p>
          <p className="text-xs text-content-secondary">
            On free plans, Chef will not be usable once you hit the limit for the current billing period.
          </p>
        </div>
        
        <div className="space-y-5">
          <div className="w-full max-w-2xl">
            {isLoadingUsage ? (
              <div className="size-full h-6 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-content-primary">Token Usage</span>
                  <span className="font-semibold text-content-primary">{usagePercentage.toFixed(0)}% used</span>
                </div>
                <ProgressBar fraction={usagePercentage / 100} variant="solid" ariaLabel="Token Usage percentage" />
              </div>
            )}
          </div>
          <p className="text-sm text-content-secondary">
            {isLoadingUsage ? (
              <span className="inline-flex gap-1">
                <span className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                {' / '}
                <span className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                {' included tokens used this billing period.'}
              </span>
            ) : (
              <span>
                {`${renderTokenCount(used || 0)} / ${renderTokenCount(
                  quota || 0,
                )} included tokens used this billing period.`}
              </span>
            )}
          </p>
          {!isLoadingUsage && !isPaidPlan && used > quota ? (
            <Callout variant="upsell" className="min-w-full rounded-md">
              <div className="flex w-full flex-col gap-4">
                <h3>You&apos;ve used all the tokens included with your free plan.</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    href={`https://dashboard.convex.dev/t/${selectedTeamSlug}/settings/billing?source=chef`}
                    icon={<ExternalLinkIcon />}
                  >
                    Upgrade your plan
                  </Button>
                  <span>or add your own API key below to send more messages.</span>
                </div>
              </div>
            </Callout>
          ) : (
            <Button
              icon={<ExternalLinkIcon />}
              inline
              href={`https://dashboard.convex.dev/t/${selectedTeamSlug}/settings/billing`}
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
