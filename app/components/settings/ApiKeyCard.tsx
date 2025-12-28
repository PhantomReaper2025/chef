import { useConvex } from 'convex/react';
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';
import { EyeNoneIcon, EyeOpenIcon, PlusIcon, QuestionMarkCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@ui/Button';
import { TextInput } from '@ui/TextInput';
import { Checkbox } from '@ui/Checkbox';
import { Tooltip } from '@ui/Tooltip';
import { captureException } from '@sentry/remix';
import { Spinner } from '@ui/Spinner';
import { useDebounce } from '@uidotdev/usehooks';

export function ApiKeyCard() {
  const convex = useConvex();

  const apiKey = useQuery(api.apiKeys.apiKeyForCurrentMember);

  const handleAlwaysUseKeyChange = async (value: boolean) => {
    try {
      await convex.mutation(api.apiKeys.setApiKeyForCurrentMember, {
        apiKey: {
          preference: value ? 'always' : 'quotaExhausted',
          value: apiKey?.value,
          openai: apiKey?.openai,
          xai: apiKey?.xai,
          google: apiKey?.google,
        },
      });
      toast.success('Preference updated.', { id: value ? 'always' : 'quotaExhausted' });
    } catch (error) {
      captureException(error);
      toast.error('Failed to update preference');
    }
  };

  const hasAnyKey = apiKey && (apiKey.value || apiKey.openai || apiKey.xai || apiKey.google);

  const validateAnthropicApiKey = async (apiKey: string) => {
    return await convex.action(api.apiKeys.validateAnthropicApiKey, {
      apiKey,
    });
  };

  const validateOpenaiApiKey = async (apiKey: string) => {
    return await convex.action(api.apiKeys.validateOpenaiApiKey, {
      apiKey,
    });
  };

  const validateGoogleApiKey = async (apiKey: string) => {
    return await convex.action(api.apiKeys.validateGoogleApiKey, {
      apiKey,
    });
  };

  const validateXaiApiKey = async (apiKey: string) => {
    return await convex.action(api.apiKeys.validateXaiApiKey, {
      apiKey,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-bolt-elements-background-depth-1 shadow-sm">
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-content-primary">API Keys</h2>

          <p className="mb-1 max-w-prose text-sm text-content-secondary">
            You can use your own API keys to cook with Chef.
          </p>
          <p className="mb-6 max-w-prose text-sm text-content-secondary">
            By default, Chef will use tokens built into your Convex plan.
          </p>
          
          <AlwaysUseKeyCheckbox
            isLoading={apiKey === undefined}
            disabled={!hasAnyKey}
            value={apiKey?.preference === 'always'}
            onChange={handleAlwaysUseKeyChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <ApiKeyProviderCard
          label="Anthropic"
          description="Claude models for balanced performance"
          keyType="anthropic"
          value={apiKey?.value || ''}
          isLoading={apiKey === undefined}
          onValidate={validateAnthropicApiKey}
          instructionsUrl="https://docs.anthropic.com/en/api/getting-started#accessing-the-api"
        />

        <ApiKeyProviderCard
          label="Google"
          description="Gemini models for fast responses"
          keyType="google"
          value={apiKey?.google || ''}
          isLoading={apiKey === undefined}
          onValidate={validateGoogleApiKey}
          instructionsUrl="https://ai.google.dev/gemini-api/docs/api-key"
        />

        <ApiKeyProviderCard
          label="OpenAI"
          description="GPT models for advanced reasoning"
          keyType="openai"
          value={apiKey?.openai || ''}
          isLoading={apiKey === undefined}
          onValidate={validateOpenaiApiKey}
          instructionsUrl="https://platform.openai.com/docs/api-reference/introduction"
        />

        <ApiKeyProviderCard
          label="xAI"
          description="Grok models for efficient performance"
          keyType="xai"
          value={apiKey?.xai || ''}
          isLoading={apiKey === undefined}
          onValidate={validateXaiApiKey}
          instructionsUrl="https://docs.x.ai/docs/overview#welcome"
        />
      </div>
    </div>
  );
}

type KeyType = 'anthropic' | 'google' | 'openai' | 'xai';

function ApiKeyProviderCard({
  label,
  description,
  keyType,
  value,
  isLoading,
  onValidate,
  instructionsUrl,
}: {
  label: string;
  description: string;
  keyType: KeyType;
  value: string;
  isLoading: boolean;
  onValidate: (key: string) => Promise<boolean>;
  instructionsUrl: string;
}) {
  const convex = useConvex();
  const [showKey, setShowKey] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounce key input for validation (300ms delay)
  const debouncedKeyValue = useDebounce(newKeyValue, 300);

  // Validation function that runs when the debounced value changes
  useEffect(() => {
    const validateKey = async () => {
      // Skip validation for empty values
      if (!debouncedKeyValue.trim()) {
        setValidationError(null);
        return;
      }

      setValidationError(null);

      try {
        const isValidResult = await onValidate(debouncedKeyValue);

        if (!isValidResult) {
          setValidationError(
            `This API key appears to be invalid. Please check the instructions for generating an API key.`,
          );
        }
      } catch (error) {
        captureException(error);
        setValidationError(`Error validating API key.`);
      }
    };

    // Only run validation if there's actually something to validate
    if (debouncedKeyValue.trim()) {
      validateKey();
    }
  }, [debouncedKeyValue, convex, onValidate]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-bolt-elements-background-depth-1 p-6 shadow-sm">
        <div className="h-[120px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const hasKey = !!value;

  const handleRemoveKey = async () => {
    try {
      setIsSaving(true);

      switch (keyType) {
        case 'anthropic':
          await convex.mutation(api.apiKeys.deleteAnthropicApiKeyForCurrentMember);
          toast.success('Anthropic API key removed', { id: 'anthropic-removed' });
          break;
        case 'google':
          await convex.mutation(api.apiKeys.deleteGoogleApiKeyForCurrentMember);
          toast.success('Google API key removed', { id: 'google-removed' });
          break;
        case 'openai':
          await convex.mutation(api.apiKeys.deleteOpenaiApiKeyForCurrentMember);
          toast.success('OpenAI API key removed', { id: 'openai-removed' });
          break;
        case 'xai':
          await convex.mutation(api.apiKeys.deleteXaiApiKeyForCurrentMember);
          toast.success('xAI API key removed', { id: 'xai-removed' });
          break;
      }
    } catch (error) {
      captureException(error);
      toast.error(`Failed to remove ${keyType} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      // Get the current API key data
      const apiKey = await convex.query(api.apiKeys.apiKeyForCurrentMember);

      const apiKeyMutation = {
        preference: apiKey?.preference || ('quotaExhausted' as 'always' | 'quotaExhausted'),
        value: apiKey?.value || undefined,
        openai: apiKey?.openai || undefined,
        xai: apiKey?.xai || undefined,
        google: apiKey?.google || undefined,
      };

      switch (keyType) {
        case 'anthropic':
          apiKeyMutation.value = cleanApiKey(newKeyValue);
          break;
        case 'google':
          apiKeyMutation.google = cleanApiKey(newKeyValue);
          break;
        case 'openai':
          apiKeyMutation.openai = cleanApiKey(newKeyValue);
          break;
        case 'xai':
          apiKeyMutation.xai = cleanApiKey(newKeyValue);
          break;
      }

      await convex.mutation(api.apiKeys.setApiKeyForCurrentMember, {
        apiKey: apiKeyMutation,
      });

      toast.success(`${label} API key saved`, { id: keyType });
      setIsAdding(false);
      setNewKeyValue('');
      setValidationError(null);
    } catch (error) {
      captureException(error);
      toast.error(`Failed to save ${keyType} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewKeyValue('');
    setValidationError(null);
  };

  // Update setNewKeyValue to also clear validation errors when empty
  const handleKeyValueChange = (e: any) => {
    const value = e.target.value;
    setNewKeyValue(value);
    if (!value.trim()) {
      setValidationError(null);
    }
  };

  return (
    <div className="rounded-lg border bg-bolt-elements-background-depth-1 shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-content-primary">{label}</h3>
              {hasKey && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-util-success/10 px-2.5 py-0.5 text-xs font-medium text-util-success">
                  <div className="size-1.5 rounded-full bg-util-success" />
                  Connected
                </span>
              )}
              {!hasKey && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-content-secondary">
                  <div className="size-1.5 rounded-full bg-gray-500" />
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-sm text-content-secondary">{description}</p>
          </div>
        </div>

        {hasKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border bg-bolt-elements-background-depth-2 p-3">
              <span className="flex-1 truncate font-mono text-sm text-content-primary" aria-label="API key value">
                {showKey ? value : '•'.repeat(Math.min(value.length, 40))}
              </span>
              <Button
                onClick={() => setShowKey(!showKey)}
                icon={showKey ? <EyeNoneIcon /> : <EyeOpenIcon />}
                aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
                variant="neutral"
                inline
              />
              <Button variant="danger" onClick={handleRemoveKey} disabled={isSaving} icon={<TrashIcon />} inline />
            </div>
          </div>
        ) : isAdding ? (
          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <TextInput
                autoFocus
                type={showKey ? 'text' : 'password'}
                value={newKeyValue}
                onChange={handleKeyValueChange}
                placeholder={`Enter your ${label} API key`}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error Unclear issue with typing of design system
                action={(): void => {
                  setShowKey(!showKey);
                }}
                Icon={() => {
                  return showKey ? <EyeNoneIcon /> : <EyeOpenIcon />;
                }}
                error={newKeyValue.trim() && validationError ? validationError : undefined}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || !newKeyValue.trim()} icon={isSaving && <Spinner />}>
                Save
              </Button>
              <Button type="button" variant="neutral" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <Button variant="neutral" onClick={() => setIsAdding(true)} icon={<PlusIcon />}>
              Add API Key
            </Button>
            <a
              href={instructionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-content-link hover:underline"
            >
              How to generate an API key →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ApiKeyItem({
  label,
  description,
  isLoading,
  keyType,
  value,
  onValidate,
}: {
  label: string;
  description: React.ReactNode;
  isLoading: boolean;
  keyType: KeyType;
  value: string;
  onValidate: (key: string) => Promise<boolean>;
}) {
  const convex = useConvex();
  const [showKey, setShowKey] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounce key input for validation (300ms delay)
  const debouncedKeyValue = useDebounce(newKeyValue, 300);

  // Validation function that runs when the debounced value changes
  useEffect(() => {
    const validateKey = async () => {
      // Skip validation for empty values
      if (!debouncedKeyValue.trim()) {
        setValidationError(null);
        return;
      }

      setValidationError(null);

      try {
        const isValidResult = await onValidate(debouncedKeyValue);

        if (!isValidResult) {
          setValidationError(
            `This API key appears to be invalid. Please check the instructions for generating an API key.`,
          );
        }
      } catch (error) {
        captureException(error);
        setValidationError(`Error validating API key.`);
      }
    };

    // Only run validation if there's actually something to validate
    if (debouncedKeyValue.trim()) {
      validateKey();
    }
  }, [debouncedKeyValue, convex, onValidate]);

  if (isLoading) {
    return <div className="h-[78px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
  }

  const hasKey = !!value;

  const handleRemoveKey = async () => {
    try {
      setIsSaving(true);

      switch (keyType) {
        case 'anthropic':
          await convex.mutation(api.apiKeys.deleteAnthropicApiKeyForCurrentMember);
          toast.success('Anthropic API key removed', { id: 'anthropic-removed' });
          break;
        case 'google':
          await convex.mutation(api.apiKeys.deleteGoogleApiKeyForCurrentMember);
          toast.success('Google API key removed', { id: 'google-removed' });
          break;
        case 'openai':
          await convex.mutation(api.apiKeys.deleteOpenaiApiKeyForCurrentMember);
          toast.success('OpenAI API key removed', { id: 'openai-removed' });
          break;
        case 'xai':
          await convex.mutation(api.apiKeys.deleteXaiApiKeyForCurrentMember);
          toast.success('xAI API key removed', { id: 'xai-removed' });
          break;
      }
    } catch (error) {
      captureException(error);
      toast.error(`Failed to remove ${keyType} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      // Get the current API key data
      const apiKey = await convex.query(api.apiKeys.apiKeyForCurrentMember);

      const apiKeyMutation = {
        preference: apiKey?.preference || ('quotaExhausted' as 'always' | 'quotaExhausted'),
        value: apiKey?.value || undefined,
        openai: apiKey?.openai || undefined,
        xai: apiKey?.xai || undefined,
        google: apiKey?.google || undefined,
      };

      switch (keyType) {
        case 'anthropic':
          apiKeyMutation.value = cleanApiKey(newKeyValue);
          break;
        case 'google':
          apiKeyMutation.google = cleanApiKey(newKeyValue);
          break;
        case 'openai':
          apiKeyMutation.openai = cleanApiKey(newKeyValue);
          break;
        case 'xai':
          apiKeyMutation.xai = cleanApiKey(newKeyValue);
          break;
      }

      await convex.mutation(api.apiKeys.setApiKeyForCurrentMember, {
        apiKey: apiKeyMutation,
      });

      toast.success(`${label} saved`, { id: keyType });
      setIsAdding(false);
      setNewKeyValue('');
      setValidationError(null);
    } catch (error) {
      captureException(error);
      toast.error(`Failed to save ${keyType} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewKeyValue('');
    setValidationError(null);
  };

  // Update setNewKeyValue to also clear validation errors when empty
  const handleKeyValueChange = (e: any) => {
    const value = e.target.value;
    setNewKeyValue(value);
    if (!value.trim()) {
      setValidationError(null);
    }
  };

  return (
    <div>
      <div className="mb-1.5">
        <span className="font-medium text-content-primary">{label}</span>
      </div>
      <div className="mb-2 text-xs text-content-secondary">{description}</div>

      {hasKey ? (
        <div className="flex items-center gap-2 py-1.5">
          <span className="max-w-80 truncate font-mono text-sm" aria-label="API key value">
            {showKey ? value : '•'.repeat(value.length)}
          </span>
          <Button
            onClick={() => setShowKey(!showKey)}
            icon={showKey ? <EyeNoneIcon /> : <EyeOpenIcon />}
            aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
            variant="neutral"
            inline
          />
          <Button variant="danger" onClick={handleRemoveKey} disabled={isSaving} icon={<TrashIcon />} inline />
        </div>
      ) : isAdding ? (
        <form onSubmit={handleSaveKey} className="flex flex-col gap-1">
          <div className="flex flex-col items-start gap-2">
            <div className="-mt-1 w-80">
              <TextInput
                autoFocus
                type={showKey ? 'text' : 'password'}
                value={newKeyValue}
                onChange={handleKeyValueChange}
                placeholder={`Enter your ${label}`}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error Unclear issue with typing of design system
                action={(): void => {
                  setShowKey(!showKey);
                }}
                Icon={() => {
                  return showKey ? <EyeNoneIcon /> : <EyeOpenIcon />;
                }}
                error={newKeyValue.trim() && validationError ? validationError : undefined}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || !newKeyValue.trim()} icon={isSaving && <Spinner />}>
                Save
              </Button>
              <Button type="button" variant="neutral" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <Button variant="neutral" onClick={() => setIsAdding(true)} icon={<PlusIcon />}>
          Add {label}
        </Button>
      )}
    </div>
  );
}

function AlwaysUseKeyCheckbox(props: {
  isLoading: boolean;
  disabled: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  if (props.isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-bolt-elements-background-depth-2 p-4">
        <div className="size-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="size-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }
  return (
    <Tooltip
      tip={props.disabled ? "You cannot use this setting when you don't have any API keys configured." : undefined}
    >
      <div className="rounded-lg border bg-bolt-elements-background-depth-2 p-4 transition-all hover:bg-bolt-elements-background-depth-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={props.value}
            onChange={() => {
              props.onChange(!props.value);
            }}
            disabled={props.disabled}
            id="always-use-key"
          />
          <label 
            htmlFor="always-use-key" 
            className="flex-1 cursor-pointer text-sm font-medium text-content-primary"
          >
            Always use my API keys
          </label>
          <Tooltip tip="When unchecked, your API key will only be used if you've run out of tokens built into your Convex plan">
            <QuestionMarkCircledIcon className="text-content-secondary" />
          </Tooltip>
        </div>
        <p className="ml-7 mt-1 text-xs text-content-secondary">
          When enabled, Chef will prioritize your API keys over built-in tokens
        </p>
      </div>
    </Tooltip>
  );
}

function cleanApiKey(key: string) {
  return key.trim() === '' ? undefined : key;
}
