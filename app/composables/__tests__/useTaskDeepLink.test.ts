import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, isRef, reactive, ref } from 'vue';
import type { Task } from '@/types/tarkov';
type QueryRecord = Record<string, string | string[] | undefined>;
const routeState = reactive({
  query: reactive<QueryRecord>({}),
});
const applyRouteQuery = (query: QueryRecord) => {
  Object.keys(routeState.query).forEach((key) => {
    routeState.query[key] = undefined;
  });
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      routeState.query[key] = value;
    }
  });
};
const replace = vi.fn(async ({ query }: { query: QueryRecord }) => {
  applyRouteQuery(query);
});
mockNuxtImport('useRoute', () => () => routeState);
mockNuxtImport('useRouter', () => () => ({
  replace,
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  onError: vi.fn(),
  afterEach: vi.fn(),
}));
const metadataTasks = ref<Task[]>([]);
const metadataState = reactive({
  tasksObjectivesHydrated: false,
});
const preferenceState = reactive({
  hideNonKappaTasks: false,
  onlyTasksWithRequiredKeys: true,
  showLightkeeperTasks: true,
  showNonSpecialTasks: true,
  taskPrimaryView: 'all',
  taskSecondaryView: 'all',
});
const setHideNonKappaTasks = vi.fn((value: boolean) => {
  preferenceState.hideNonKappaTasks = value;
});
const setOnlyTasksWithRequiredKeys = vi.fn((value: boolean) => {
  preferenceState.onlyTasksWithRequiredKeys = value;
});
const setShowLightkeeperTasks = vi.fn((value: boolean) => {
  preferenceState.showLightkeeperTasks = value;
});
const setShowNonSpecialTasks = vi.fn((value: boolean) => {
  preferenceState.showNonSpecialTasks = value;
});
const setTaskPrimaryView = vi.fn((value: string) => {
  preferenceState.taskPrimaryView = value;
});
const setTaskSecondaryView = vi.fn((value: string) => {
  preferenceState.taskSecondaryView = value;
});
const tasksCompletions = ref<Record<string, Record<string, boolean>>>({});
const tasksFailed = ref<Record<string, Record<string, boolean>>>({});
const unlockedTasks = ref<Record<string, Record<string, boolean>>>({});
const trackFocusedTaskVisible = vi.fn();
describe('useTaskDeepLink', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
    applyRouteQuery({});
    metadataTasks.value = [];
    metadataState.tasksObjectivesHydrated = false;
    preferenceState.hideNonKappaTasks = false;
    preferenceState.onlyTasksWithRequiredKeys = true;
    preferenceState.showLightkeeperTasks = true;
    preferenceState.showNonSpecialTasks = true;
    preferenceState.taskPrimaryView = 'all';
    preferenceState.taskSecondaryView = 'all';
    tasksCompletions.value = {};
    tasksFailed.value = {};
    unlockedTasks.value = {};
    vi.doMock('pinia', async () => {
      const actual = await vi.importActual<typeof import('pinia')>('pinia');
      return {
        ...actual,
        storeToRefs: (store: Record<string, unknown>) => {
          const refs: Record<string, unknown> = {};
          Object.entries(store).forEach(([key, value]) => {
            if (typeof value === 'function') return;
            refs[key] = isRef(value) ? value : computed(() => store[key as keyof typeof store]);
          });
          return refs;
        },
      };
    });
    vi.doMock('@/stores/useMetadata', () => ({
      useMetadataStore: () => ({
        tasks: metadataTasks,
        get tasksObjectivesHydrated() {
          return metadataState.tasksObjectivesHydrated;
        },
        getTraderByName: () => undefined,
      }),
    }));
    vi.doMock('@/stores/usePreferences', () => ({
      usePreferencesStore: () => ({
        get getHideNonKappaTasks() {
          return preferenceState.hideNonKappaTasks;
        },
        get getOnlyTasksWithRequiredKeys() {
          return preferenceState.onlyTasksWithRequiredKeys;
        },
        get getShowLightkeeperTasks() {
          return preferenceState.showLightkeeperTasks;
        },
        get getShowNonSpecialTasks() {
          return preferenceState.showNonSpecialTasks;
        },
        get getTaskPrimaryView() {
          return preferenceState.taskPrimaryView;
        },
        get getTaskSecondaryView() {
          return preferenceState.taskSecondaryView;
        },
        setHideNonKappaTasks,
        setOnlyTasksWithRequiredKeys,
        setShowLightkeeperTasks,
        setShowNonSpecialTasks,
        setTaskPrimaryView,
        setTaskSecondaryView,
      }),
    }));
    vi.doMock('@/stores/useProgress', () => ({
      useProgressStore: () => ({
        tasksCompletions,
        tasksFailed,
        unlockedTasks,
      }),
    }));
    vi.doMock('@/composables/useDashboardFocusAnalytics', () => ({
      useDashboardFocusAnalytics: () => ({
        trackFocusedTaskVisible,
      }),
    }));
  });
  it('does not clear required-keys preference before objectives hydrate', async () => {
    metadataTasks.value = [
      {
        id: 'task-no-keys',
        name: 'Task Without Keys',
        requiredKeys: [],
      },
    ];
    applyRouteQuery({ task: 'task-no-keys' });
    const { useTaskDeepLink } = await import('@/composables/useTaskDeepLink');
    const taskDeepLink = useTaskDeepLink({
      searchQuery: ref(''),
      filteredTasks: ref([]),
      leafletMapRef: ref(null),
    });
    await taskDeepLink.handleTaskQueryParam();
    expect(setOnlyTasksWithRequiredKeys).not.toHaveBeenCalled();
    expect(preferenceState.onlyTasksWithRequiredKeys).toBe(true);
  });
  it('clears required-keys preference after objectives hydrate when task has no keys', async () => {
    metadataState.tasksObjectivesHydrated = true;
    metadataTasks.value = [
      {
        id: 'task-no-keys',
        name: 'Task Without Keys',
        requiredKeys: [],
      },
    ];
    applyRouteQuery({ task: 'task-no-keys' });
    const { useTaskDeepLink } = await import('@/composables/useTaskDeepLink');
    const taskDeepLink = useTaskDeepLink({
      searchQuery: ref(''),
      filteredTasks: ref([]),
      leafletMapRef: ref(null),
    });
    await taskDeepLink.handleTaskQueryParam();
    expect(setOnlyTasksWithRequiredKeys).toHaveBeenCalledWith(false);
    expect(preferenceState.onlyTasksWithRequiredKeys).toBe(false);
  });
  it('keeps the deep-linked task focused even when it is already visible', async () => {
    metadataTasks.value = [
      {
        id: 'task-visible',
        name: 'Visible Task',
        requiredKeys: [],
      },
    ];
    applyRouteQuery({ task: 'task-visible' });
    const taskElement = document.createElement('div');
    taskElement.id = 'task-task-visible';
    taskElement.scrollIntoView = vi.fn();
    document.body.appendChild(taskElement);
    const { useTaskDeepLink } = await import('@/composables/useTaskDeepLink');
    const taskDeepLink = useTaskDeepLink({
      searchQuery: ref(''),
      filteredTasks: ref(metadataTasks.value),
      leafletMapRef: ref(null),
    });
    await taskDeepLink.handleTaskQueryParam();
    expect(taskDeepLink.pinnedTaskId.value).toBe('task-visible');
    expect(taskElement.scrollIntoView).toHaveBeenCalled();
    expect(trackFocusedTaskVisible).toHaveBeenCalledWith('task-visible');
    expect(replace).toHaveBeenCalledWith({ query: {} });
  });
  it('keeps the task query intact until the target task is available to focus', async () => {
    metadataTasks.value = [
      {
        id: 'task-delayed',
        name: 'Delayed Task',
        requiredKeys: [],
      },
    ];
    applyRouteQuery({ task: 'task-delayed' });
    const { useTaskDeepLink } = await import('@/composables/useTaskDeepLink');
    const filteredTasks = ref<Task[]>(metadataTasks.value);
    const taskDeepLink = useTaskDeepLink({
      searchQuery: ref(''),
      filteredTasks,
      leafletMapRef: ref(null),
    });
    await taskDeepLink.handleTaskQueryParam();
    expect(taskDeepLink.pinnedTaskId.value).toBe('task-delayed');
    expect(replace).not.toHaveBeenCalled();
    const taskElement = document.createElement('div');
    taskElement.id = 'task-task-delayed';
    taskElement.scrollIntoView = vi.fn();
    document.body.appendChild(taskElement);
    await taskDeepLink.handleTaskQueryParam();
    expect(taskDeepLink.pinnedTaskId.value).toBe('task-delayed');
    expect(trackFocusedTaskVisible).toHaveBeenCalledWith('task-delayed');
    expect(replace).toHaveBeenCalledWith({ query: {} });
  });
});
