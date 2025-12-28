import { Spinner } from '@ui/Spinner';

export function Loading(props: { message?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-content-secondary animate-fadeIn">
      <div className="flex size-12 items-center justify-center rounded-full bg-bolt-elements-background-depth-2 ring-1 ring-border-primary">
        <Spinner />
      </div>
      <p className="text-sm font-medium">{props.message ?? 'Loading...'}</p>
    </div>
  );
}
