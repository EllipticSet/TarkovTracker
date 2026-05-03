// @vitest-environment happy-dom
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMetadataStore } from '@/stores/useMetadata';
import * as cacheUtils from '@/utils/tarkovCache';
import { createDeferred } from '@/utils/test-helpers';
import type { TarkovItem, TarkovItemsQueryResult } from '@/types/tarkov';
const loggerMock = vi.hoisted(() => ({
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}));
vi.mock('@/utils/logger', () => ({
  logger: loggerMock,
}));
const createItem = (id: string, name: string): TarkovItem =>
  ({
    id,
    name,
    shortName: name,
  }) as TarkovItem;
describe('useMetadataStore fetchItemsData', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.spyOn(cacheUtils, 'getCachedData').mockResolvedValue(null);
    vi.spyOn(cacheUtils, 'setCachedData').mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it('does not reuse or apply an in-flight lite items response after a locale switch', async () => {
    const store = useMetadataStore();
    const enResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const deResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const fetchMock = vi.fn((_: string, options?: { query?: Record<string, string> }) => {
      return options?.query?.lang === 'de' ? deResponse.promise : enResponse.promise;
    });
    vi.stubGlobal('$fetch', fetchMock);
    store.itemsLanguage = 'stale';
    const enRequest = store.fetchItemsLiteData();
    await flushPromises();
    store.languageCode = 'de';
    const deRequest = store.fetchItemsLiteData();
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.itemsLoading).toBe(true);
    enResponse.resolve({ data: { items: [createItem('en-item', 'English item')] } });
    await enRequest;
    expect(store.itemsLanguage).toBe('stale');
    expect(store.items).toEqual([]);
    expect(store.itemsLoading).toBe(true);
    deResponse.resolve({ data: { items: [createItem('de-item', 'German item')] } });
    await deRequest;
    expect(store.items.map((item) => item.id)).toEqual(['de-item']);
    expect(store.itemsLanguage).toBe('de');
    expect(store.itemsGameMode).toBe('regular');
    expect(store.itemsFullLoaded).toBe(false);
    expect(store.itemsLoading).toBe(false);
  });
  it('does not reuse or apply an in-flight full items response after a locale switch', async () => {
    const store = useMetadataStore();
    const enResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const deResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const fetchMock = vi.fn((_: string, options?: { query?: Record<string, string> }) => {
      return options?.query?.lang === 'de' ? deResponse.promise : enResponse.promise;
    });
    vi.stubGlobal('$fetch', fetchMock);
    store.itemsLanguage = 'stale';
    const enRequest = store.fetchItemsFullData();
    await flushPromises();
    store.languageCode = 'de';
    const deRequest = store.fetchItemsFullData();
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    enResponse.resolve({ data: { items: [createItem('en-item', 'English item')] } });
    await enRequest;
    expect(store.itemsLanguage).toBe('stale');
    expect(store.items).toEqual([]);
    deResponse.resolve({ data: { items: [createItem('de-item', 'German item')] } });
    await deRequest;
    expect(store.items.map((item) => item.id)).toEqual(['de-item']);
    expect(store.itemsLanguage).toBe('de');
    expect(store.itemsGameMode).toBe('regular');
    expect(store.itemsFullLoaded).toBe(true);
  });
  it('does not let a stale item request set the active error state', async () => {
    const store = useMetadataStore();
    const enResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const deResponse = createDeferred<{ data: TarkovItemsQueryResult }>();
    const fetchMock = vi.fn((_: string, options?: { query?: Record<string, string> }) => {
      return options?.query?.lang === 'de' ? deResponse.promise : enResponse.promise;
    });
    vi.stubGlobal('$fetch', fetchMock);
    const enRequest = store.fetchItemsLiteData();
    await flushPromises();
    store.languageCode = 'de';
    const deRequest = store.fetchItemsLiteData();
    await flushPromises();
    enResponse.reject(new Error('old locale failed'));
    await enRequest;
    expect(store.itemsError).toBeNull();
    expect(store.itemsLoading).toBe(true);
    deResponse.resolve({ data: { items: [createItem('de-item', 'German item')] } });
    await deRequest;
    expect(store.itemsError).toBeNull();
    expect(store.items.map((item) => item.id)).toEqual(['de-item']);
  });
});
