<template>
  <section class="bg-surface-900/60 rounded-xl border border-white/5 p-5">
    <div class="mb-3 flex items-center gap-2">
      <UIcon :name="icon" class="text-primary-400 h-5 w-5" />
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
  defineProps<{
    title: string;
    icon: string;
  }>();
</script>
