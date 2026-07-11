<template>
  <div
    class="bg-surface-900/80 flex flex-col rounded-2xl border border-white/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
  >
    <div class="mb-4 flex items-start gap-4">
      <div
        v-if="resource.logo"
        class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5"
      >
        <NuxtImg
          :src="resource.logo"
          :alt="name"
          class="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="bg-primary-500/15 text-primary-300 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
      >
        <UIcon name="i-mdi-bookmark" class="h-6 w-6" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-lg font-semibold text-white">{{ name }}</h3>
        <p class="text-surface-400 mt-1 text-sm">{{ description }}</p>
      </div>
    </div>
    <div class="mt-auto flex flex-wrap items-center gap-2 pt-4">
      <UButton
        v-if="resource.hasGuide"
        :to="`/resources/${resource.slug}`"
        size="sm"
        color="primary"
        variant="soft"
        :icon="guideIcon"
        :label="t('page.resources.view_guide', 'View Guide')"
      />
      <UButton
        v-for="link in resource.links"
        :key="link.type"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        color="neutral"
        variant="ghost"
        :icon="LINK_ICONS[link.type]"
        :label="t(`page.resources.link_types.${link.type}`, LINK_LABEL_FALLBACKS[link.type])"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import {
    LINK_ICONS,
    LINK_LABEL_FALLBACKS,
    type Resource,
  } from '@/features/resources/resourceData';
  const { t } = useI18n({ useScope: 'global' });
  const props = defineProps<{ resource: Resource }>();
  const name = computed(() => t(`page.resources.items.${props.resource.slug}.name`));
  const description = computed(() => t(`page.resources.items.${props.resource.slug}.description`));
  const guideIcon = 'i-mdi-book-open-page-variant';
</script>
