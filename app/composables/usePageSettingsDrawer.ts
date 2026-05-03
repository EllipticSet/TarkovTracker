const PAGE_SETTINGS_DRAWER_STATE_KEYS: Record<string, string> = {
  hideout: 'hideoutSettingsDrawer:isOpen',
  needed_items: 'neededItemsSettingsDrawer:isOpen',
  tasks: 'taskSettingsDrawer:isOpen',
};
export function usePageSettingsDrawer(pageKey: string): {
  isOpen: globalThis.Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
} {
  const stateKey = PAGE_SETTINGS_DRAWER_STATE_KEYS[pageKey] ?? `${pageKey}SettingsDrawer:isOpen`;
  const isOpen = useState<boolean>(stateKey, () => false);
  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };
  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
