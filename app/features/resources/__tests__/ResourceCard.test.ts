// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ResourceCard from '@/features/resources/ResourceCard.vue';
import type { Resource } from '@/features/resources/resourceData';
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-i18n')>()),
  useI18n: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));
const mountCard = (resource: Resource) =>
  mount(ResourceCard, {
    props: { resource },
    global: {
      stubs: {
        NuxtImg: { props: ['alt', 'src'], template: '<img :alt="alt" :src="src" />' },
        UButton: {
          props: ['href', 'label', 'to'],
          template: '<a :href="href || to">{{ label }}</a>',
        },
        UIcon: true,
      },
    },
  });
describe('ResourceCard', () => {
  it('renders a guide link, external links, and the resource logo', () => {
    const wrapper = mountCard({
      slug: 'ratscanner',
      logo: '/img/logos/ratscannerlogo.webp',
      hasGuide: true,
      guide: { steps: 1, tips: 1, faq: 1 },
      links: [{ type: 'github', url: 'https://github.com/RatScanner/RatScanner' }],
    });
    expect(wrapper.get('img').attributes()).toMatchObject({
      alt: 'ratscanner',
      src: '/img/logos/ratscannerlogo.webp',
    });
    expect(wrapper.get('a[href="/resources/ratscanner"]').text()).toBe('View Guide');
    expect(wrapper.get('a[href="https://github.com/RatScanner/RatScanner"]').text()).toBe('GitHub');
  });
  it('renders the placeholder icon without a guide link when configured', () => {
    const wrapper = mountCard({
      slug: 'cultistcircle',
      logo: null,
      hasGuide: false,
      links: [],
    });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('a[href="/resources/cultistcircle"]').exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'UIcon' }).exists()).toBe(true);
  });
});
