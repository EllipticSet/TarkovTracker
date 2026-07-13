import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RESOURCES } from '@/features/resources/resourceData';
type LocaleNode = Record<string, unknown>;
const en = JSON.parse(readFileSync(join(process.cwd(), 'app/locales/en.json'), 'utf8')) as {
  page: {
    resources: {
      items: Record<string, { name?: string; description?: string }>;
      guides: Record<string, LocaleNode>;
    };
  };
};
const resourcesLocale = en.page.resources;
const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const expectedGuideKeys = (steps: number, tips: number, faq: number): string[] => {
  const keys = ['overview'];
  for (let n = 1; n <= steps; n++) {
    keys.push(`step_${n}_title`, `step_${n}_desc`);
  }
  for (let n = 1; n <= tips; n++) {
    keys.push(`tip_${n}`);
  }
  for (let n = 1; n <= faq; n++) {
    keys.push(`faq_${n}_q`, `faq_${n}_a`);
  }
  return keys;
};
describe('resourceData locale parity', () => {
  it('defines at least one resource', () => {
    expect(RESOURCES.length).toBeGreaterThan(0);
  });
  it.each(RESOURCES.map((resource) => [resource.slug, resource] as const))(
    'has non-empty item name and description for %s',
    (slug) => {
      const item = resourcesLocale.items[slug];
      expect(item, `missing page.resources.items.${slug}`).toBeDefined();
      expect(nonEmptyString(item?.name), `page.resources.items.${slug}.name`).toBe(true);
      expect(nonEmptyString(item?.description), `page.resources.items.${slug}.description`).toBe(
        true
      );
    }
  );
  it.each(
    RESOURCES.filter((resource) => resource.hasGuide).map(
      (resource) => [resource.slug, resource] as const
    )
  )('has matching guide locale keys for %s', (slug, resource) => {
    const guideConfig = resource.guide;
    if (!guideConfig) {
      throw new Error(`${slug} hasGuide without guide config`);
    }
    const guideLocale = resourcesLocale.guides[slug];
    if (!guideLocale) {
      throw new Error(`missing page.resources.guides.${slug}`);
    }
    const requiredKeys = expectedGuideKeys(guideConfig.steps, guideConfig.tips, guideConfig.faq);
    for (const key of requiredKeys) {
      expect(
        nonEmptyString(guideLocale[key]),
        `missing or empty page.resources.guides.${slug}.${key}`
      ).toBe(true);
    }
    const localeKeys = Object.keys(guideLocale);
    for (const key of localeKeys) {
      if (key === 'overview') continue;
      const stepMatch = key.match(/^step_(\d+)_(?:title|desc)$/);
      if (stepMatch) {
        expect(Number(stepMatch[1]), `orphan ${slug}.${key}`).toBeLessThanOrEqual(
          guideConfig.steps
        );
        continue;
      }
      const tipMatch = key.match(/^tip_(\d+)$/);
      if (tipMatch) {
        expect(Number(tipMatch[1]), `orphan ${slug}.${key}`).toBeLessThanOrEqual(guideConfig.tips);
        continue;
      }
      const faqMatch = key.match(/^faq_(\d+)_[qa]$/);
      if (faqMatch) {
        expect(Number(faqMatch[1]), `orphan ${slug}.${key}`).toBeLessThanOrEqual(guideConfig.faq);
      }
    }
  });
  it('does not declare guide configs for resources without hasGuide', () => {
    for (const resource of RESOURCES.filter((entry) => !entry.hasGuide)) {
      expect(resource.guide, `${resource.slug} should not define guide`).toBeUndefined();
      expect(resourcesLocale.guides[resource.slug]).toBeUndefined();
    }
  });
});
