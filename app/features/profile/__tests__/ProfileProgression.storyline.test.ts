// @vitest-environment happy-dom
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const setStoryChapterCompleteMock = vi.fn();
const setStoryChapterUncompleteMock = vi.fn();
const setStoryObjectiveCompleteMock = vi.fn();
const setStoryObjectiveUncompleteMock = vi.fn();
const isStoryChapterCompleteMock = vi.fn(() => false);
const isStoryObjectiveCompleteMock = vi.fn(() => false);
let pvpOverrides: Record<string, unknown> = {};
const storyChaptersMetadata = [
  {
    id: 'chapter-1',
    name: 'Chapter 1',
    normalizedName: 'tour',
    wikiLink: '',
    order: 1,
    objectives: [
      { id: 'obj-1', order: 1, type: 'main' as const, description: 'Linear' },
      {
        id: 'obj-2',
        order: 2,
        type: 'main' as const,
        description: 'Route A',
        mutuallyExclusiveWith: ['obj-3'],
      },
      {
        id: 'obj-3',
        order: 3,
        type: 'main' as const,
        description: 'Route B',
        mutuallyExclusiveWith: ['obj-2'],
      },
    ],
  },
];
const createProgressData = (overrides: Record<string, unknown> = {}) => ({
  level: 1,
  pmcFaction: 'USEC',
  displayName: null,
  xpOffset: 0,
  taskObjectives: {},
  taskCompletions: {},
  hideoutParts: {},
  hideoutModules: {},
  traders: {},
  skills: {},
  prestigeLevel: 0,
  progressEpoch: 0,
  skillOffsets: {},
  storyChapters: {},
  apiUpdateHistory: [],
  ...overrides,
});
vi.mock('@/stores/useTarkov', () => ({
  useTarkovStore: () => ({
    isStoryChapterComplete: isStoryChapterCompleteMock,
    isStoryObjectiveComplete: isStoryObjectiveCompleteMock,
    setStoryChapterComplete: setStoryChapterCompleteMock,
    setStoryChapterUncomplete: setStoryChapterUncompleteMock,
    setStoryObjectiveComplete: setStoryObjectiveCompleteMock,
    setStoryObjectiveUncomplete: setStoryObjectiveUncompleteMock,
    getCurrentGameMode: () => 'pvp',
    getGameEdition: () => 1,
    getPvPProgressData: () => createProgressData(pvpOverrides),
    getPvEProgressData: () => createProgressData(),
    getDisplayName: () => 'User',
    getTarkovUid: () => null,
  }),
}));
vi.mock('@/stores/useMetadata', () => ({
  useMetadataStore: () => ({
    storyChapters: storyChaptersMetadata,
    tasks: [],
    hideoutStations: [],
    loading: false,
  }),
}));
vi.mock('@/stores/usePreferences', () => ({
  usePreferencesStore: () => ({
    getUseAutomaticLevelCalculation: false,
    getProfileSharePvpPublic: false,
    getProfileSharePvePublic: false,
  }),
}));
vi.mock('@/stores/useProgress', () => ({
  useProgressStore: () => ({
    getLevel: () => 1,
    tasksCompletions: {},
    tasksFailed: {},
  }),
}));
vi.mock('@/utils/editionHelpers', () => ({
  isTaskAvailableForEdition: () => true,
}));
vi.mock('@/utils/formatters', () => ({
  calculatePercentageNum: () => 0,
  useLocaleNumberFormatter: () => (n: number) => String(n),
}));
vi.mock('@/utils/tarkovDevProfileUrl', () => ({
  buildTarkovDevProfileUrl: () => undefined,
}));
vi.mock('@/utils/taskStatus', () => ({
  getCompletionFlags: () => ({ complete: false, failed: false }),
}));
vi.mock('@/utils/taskTypeFilters', () => ({
  filterTasksByTypeSettings: () => [],
}));
vi.mock('@/utils/progressInvalidation', () => ({
  computeInvalidProgress: () => ({ invalidTasks: [], invalidObjectives: [] }),
}));
vi.mock('@/composables/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: vi.fn() }),
}));
mockNuxtImport('useRoute', () => () => ({ params: {}, query: {} }));
mockNuxtImport('useRouter', () => () => ({ replace: vi.fn() }));
mockNuxtImport('useI18n', () => () => ({
  t: (key: string, fallback?: string) => fallback ?? key,
  locale: { value: 'en' },
}));
mockNuxtImport('useSeoMeta', () => () => {});
mockNuxtImport('useNuxtApp', () => () => ({
  $supabase: {
    user: { loggedIn: false, id: null },
    client: { from: () => ({ upsert: vi.fn() }) },
  },
}));
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-i18n')>()),
  useI18n: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    locale: { value: 'en' },
  }),
}));
const createWrapper = async () => {
  const { default: ProfileProgression } = await import('@/features/profile/ProfileProgression.vue');
  return mount(ProfileProgression, {
    global: {
      plugins: [createPinia()],
      stubs: {
        ProfileOverviewTab: true,
        ProfileTasksTab: true,
        ProfileHideoutTab: true,
        ProfileStorylineTab: {
          emits: ['toggle-chapter', 'toggle-objective'],
          template:
            '<div data-testid="storyline-tab"><button data-testid="toggle-chapter" @click="$emit(\'toggle-chapter\', \'chapter-1\')" /></div>',
        },
        UTabs: {
          props: ['items', 'modelValue'],
          emits: ['update:model-value'],
          template:
            '<div data-testid="tabs"><button data-testid="select-storyline-tab" @click="$emit(\'update:model-value\', 3)" /></div>',
        },
        UAlert: true,
        UBadge: { template: '<span><slot /></span>' },
        UButton: { template: '<button><slot /></button>' },
        UIcon: true,
        NuxtLink: { template: '<a><slot /></a>' },
      },
    },
  });
};
describe('ProfileProgression storyline chapter toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    pvpOverrides = {};
    isStoryChapterCompleteMock.mockReturnValue(false);
    isStoryObjectiveCompleteMock.mockReturnValue(false);
  });
  it('delegates chapter toggle to store and auto-completes non-route objectives', async () => {
    const wrapper = await createWrapper();
    await wrapper.get('[data-testid="select-storyline-tab"]').trigger('click');
    await wrapper.get('[data-testid="toggle-chapter"]').trigger('click');
    expect(setStoryChapterCompleteMock).toHaveBeenCalledWith('chapter-1');
    expect(setStoryObjectiveCompleteMock).toHaveBeenCalledWith('chapter-1', 'obj-1');
    expect(setStoryObjectiveCompleteMock).not.toHaveBeenCalledWith('chapter-1', 'obj-2');
    expect(setStoryObjectiveCompleteMock).not.toHaveBeenCalledWith('chapter-1', 'obj-3');
    wrapper.unmount();
  });
  it('delegates chapter uncomplete to store and auto-uncompletes non-route objectives', async () => {
    pvpOverrides = {
      storyChapters: {
        'chapter-1': {
          complete: true,
          timestamp: 1000,
          objectives: {
            'obj-1': { complete: true, timestamp: 1000 },
          },
        },
      },
    };
    const wrapper = await createWrapper();
    await wrapper.get('[data-testid="select-storyline-tab"]').trigger('click');
    await wrapper.get('[data-testid="toggle-chapter"]').trigger('click');
    expect(setStoryChapterUncompleteMock).toHaveBeenCalledWith('chapter-1');
    expect(setStoryObjectiveUncompleteMock).toHaveBeenCalledWith('chapter-1', 'obj-1');
    wrapper.unmount();
  });
});
