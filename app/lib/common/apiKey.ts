import type { Doc } from '@convex/_generated/dataModel';
import { type ModelSelection } from '~/utils/constants';

export function hasApiKeySet(
  modelSelection: ModelSelection,
  useGeminiAuto: boolean,
  apiKey?: Doc<'convexMembers'>['apiKey'] | null,
) {
  if (!apiKey) {
    return false;
  }

  switch (modelSelection) {
    case 'auto':
      if (useGeminiAuto) {
        return !!apiKey.google?.trim();
      }
      return !!apiKey.value?.trim();
    case 'claude-3-5-haiku':
    case 'claude-4-sonnet':
    case 'claude-4.5-sonnet':
      return !!apiKey.value?.trim();
    case 'gpt-4.1':
    case 'gpt-4.1-mini':
    case 'gpt-5':
      return !!apiKey.openai?.trim();
    case 'grok-3-mini':
      return !!apiKey.xai?.trim();
    case 'gemini-2.5-pro':
      return !!apiKey.google?.trim();
    case 'openrouter/anthropic/claude-3.5-sonnet':
    case 'openrouter/openai/gpt-4-turbo':
    case 'openrouter/meta-llama/llama-3.3-70b-instruct':
    case 'openrouter/google/gemini-2.0-flash-exp':
    case 'openrouter/mistralai/mistral-large':
      return !!apiKey.openrouter?.trim();
    default: {
      const _exhaustiveCheck: never = modelSelection;
      return false;
    }
  }
}

export function hasAnyApiKeySet(apiKey?: Doc<'convexMembers'>['apiKey'] | null) {
  if (!apiKey) {
    return false;
  }
  return Object.entries(apiKey).some(([key, value]) => {
    if (key === 'preference') {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    return false;
  });
}
