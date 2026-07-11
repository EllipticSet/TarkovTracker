<template>
  <UContainer class="px-4 py-8">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="text-center">
        <h1 class="text-2xl font-bold text-white sm:text-3xl">
          {{ t('page.resources.title', 'Resources & Guides') }}
        </h1>
        <p class="text-surface-400 mx-auto mt-2 max-w-xl text-sm">
          {{
            t(
              'page.resources.subtitle',
              'Community tools, integrations, and guides to help you get the most out of TarkovTracker and the wider Escape from Tarkov ecosystem.'
            )
          }}
        </p>
      </header>
      <div v-if="featuredResources.length" class="space-y-4">
        <h2 class="text-surface-400 text-xs font-semibold tracking-wider uppercase">
          {{ t('page.resources.section_featured', 'Featured') }}
        </h2>
        <div class="grid gap-6 md:grid-cols-2">
          <ResourceCard
            v-for="resource in featuredResources"
            :key="resource.slug"
            :resource="resource"
          />
        </div>
      </div>
      <div class="space-y-4">
        <h2 class="text-surface-400 text-xs font-semibold tracking-wider uppercase">
          {{ t('page.resources.section_all', 'All Resources') }}
        </h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ResourceCard
            v-for="resource in otherResources"
            :key="resource.slug"
            :resource="resource"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>
<script setup lang="ts">
  import ResourceCard from '@/features/resources/ResourceCard.vue';
  import { RESOURCES } from '@/features/resources/resourceData';
  const { t } = useI18n({ useScope: 'global' });
  definePageMeta({ layout: 'default' });
  useSeoMeta({
    title: computed(() => t('page.resources.title', 'Resources & Guides')),
    description: computed(() =>
      t(
        'page.resources.subtitle',
        'Community tools, integrations, and guides to help you get the most out of TarkovTracker and the wider Escape from Tarkov ecosystem.'
      )
    ),
    ogTitle: computed(() => t('page.resources.title', 'Resources & Guides')),
    ogDescription: computed(() =>
      t(
        'page.resources.subtitle',
        'Community tools, integrations, and guides to help you get the most out of TarkovTracker and the wider Escape from Tarkov ecosystem.'
      )
    ),
  });
  const featuredResources = computed(() => RESOURCES.filter((r) => r.featured));
  const otherResources = computed(() => RESOURCES.filter((r) => !r.featured));
</script>
