<template>
  <UContainer class="px-4 py-8">
    <div v-if="!resource || !resource.hasGuide" class="mx-auto max-w-2xl py-16 text-center">
      <UIcon name="i-mdi-alert-circle-outline" class="text-surface-500 mb-3 h-12 w-12" />
      <p class="text-surface-400">
        {{
          t(
            'page.resources.guide_not_found',
            'Guide not found. The resource you are looking for may not have a guide yet.'
          )
        }}
      </p>
      <UButton
        to="/resources"
        color="primary"
        variant="soft"
        class="mt-4"
        :label="t('page.resources.back_to_hub', 'Back to Resources')"
        icon="i-mdi-arrow-left"
      />
    </div>
    <div v-else class="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            v-if="resource.logo"
            class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/5"
          >
            <NuxtImg :src="resource.logo" :alt="guideTitle" class="h-full w-full object-contain" />
          </div>
          <div>
            <p class="text-primary-300/80 text-xs font-semibold tracking-[0.3em] uppercase">
              {{ t('page.resources.guide_label', 'Guide') }}
            </p>
            <h1 class="text-2xl font-bold text-white">{{ guideTitle }}</h1>
          </div>
        </div>
        <NuxtLink
          to="/resources"
          class="text-surface-400 hover:text-primary-400 text-sm transition-colors"
        >
          <UIcon name="i-mdi-arrow-left" class="mr-1 inline h-4 w-4" />
          {{ t('page.resources.back_to_hub', 'Back to Resources') }}
        </NuxtLink>
      </header>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="link in resource.links"
          :key="link.type"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          color="neutral"
          variant="soft"
          :icon="LINK_ICONS[link.type]"
          :label="t(`page.resources.link_types.${link.type}`, LINK_LABEL_FALLBACKS[link.type])"
        />
      </div>
      <ResourceGuideSection
        :title="t('page.resources.guide_sections.overview', 'Overview')"
        icon="i-mdi-information-outline"
      >
        <p class="text-surface-200 text-sm leading-relaxed">{{ overviewText }}</p>
      </ResourceGuideSection>
      <ResourceGuideSection
        v-if="resource.guide && resource.guide.steps > 0"
        :title="t('page.resources.guide_sections.setup', 'Getting Started')"
        icon="i-mdi-playlist-check"
      >
        <ol class="space-y-3">
          <li v-for="n in resource.guide.steps" :key="n" class="flex items-start gap-3">
            <span
              class="bg-primary-500/20 text-primary-300 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {{ n }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-surface-100 text-sm font-medium">
                {{ t(`page.resources.guides.${resource.slug}.step_${n}_title`) }}
              </p>
              <p class="text-surface-400 mt-0.5 text-sm">
                {{ t(`page.resources.guides.${resource.slug}.step_${n}_desc`) }}
              </p>
            </div>
          </li>
        </ol>
      </ResourceGuideSection>
      <ResourceGuideSection
        v-if="resource.guide && resource.guide.tips > 0"
        :title="t('page.resources.guide_sections.tips', 'Tips & Tricks')"
        icon="i-mdi-lightbulb-on-outline"
      >
        <ul class="space-y-2">
          <li
            v-for="n in resource.guide.tips"
            :key="n"
            class="text-surface-200 flex items-start gap-2 text-sm"
          >
            <UIcon
              name="i-mdi-lightbulb-outline"
              class="text-warning-400 mt-0.5 h-4 w-4 shrink-0"
            />
            <span>{{ t(`page.resources.guides.${resource.slug}.tip_${n}`) }}</span>
          </li>
        </ul>
      </ResourceGuideSection>
      <ResourceGuideSection
        v-if="resource.guide && resource.guide.faq > 0"
        :title="t('page.resources.guide_sections.faq', 'Common Questions')"
        icon="i-mdi-help-circle-outline"
      >
        <div class="space-y-4">
          <div
            v-for="n in resource.guide.faq"
            :key="n"
            class="border-b border-white/5 pb-3 last:border-0 last:pb-0"
          >
            <p class="text-surface-100 text-sm font-medium">
              {{ t(`page.resources.guides.${resource.slug}.faq_${n}_q`) }}
            </p>
            <p class="text-surface-400 mt-1 text-sm">
              {{ t(`page.resources.guides.${resource.slug}.faq_${n}_a`) }}
            </p>
          </div>
        </div>
      </ResourceGuideSection>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
  import {
    LINK_ICONS,
    LINK_LABEL_FALLBACKS,
    getResourceBySlug,
  } from '@/features/resources/resourceData';
  import ResourceGuideSection from '@/features/resources/ResourceGuideSection.vue';
  const { t } = useI18n({ useScope: 'global' });
  const route = useRoute();
  const slug = computed(() => {
    const param = route.params.slug;
    const value = Array.isArray(param) ? param[0] : param;
    return value ?? '';
  });
  const resource = computed(() => getResourceBySlug(slug.value));
  const guideTitle = computed(() => t(`page.resources.items.${slug.value}.name`));
  const overviewText = computed(() =>
    resource.value?.hasGuide
      ? t(`page.resources.guides.${slug.value}.overview`)
      : t(
          'page.resources.subtitle',
          'Community tools, integrations, and guides to help you get the most out of TarkovTracker and the wider Escape from Tarkov ecosystem.'
        )
  );
  definePageMeta({ layout: 'default' });
  useSeoMeta({
    title: computed(() =>
      resource.value?.hasGuide
        ? t(
            'page.resources.guide_title_template',
            { name: guideTitle.value },
            `${guideTitle.value} Guide`
          )
        : t('page.resources.title', 'Resources & Guides')
    ),
    description: computed(() => overviewText.value),
  });
</script>
