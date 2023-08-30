<template>
  <div v-if="!confirm">
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button v-bind="props" text>
          <template #icon>
            <SvgIcon :icon="icon"></SvgIcon>
          </template>
        </n-button>
      </template>
      <slot></slot>
    </n-tooltip>
  </div>
  <n-popconfirm v-else @positive-click="onClick">
    <template #trigger>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button text>
            <template #icon>
              <SvgIcon :icon="icon"></SvgIcon>
            </template>
          </n-button>
        </template>
        <slot></slot>
      </n-tooltip>
    </template>
    {{ confirm }}
  </n-popconfirm>
</template>
<script setup lang="ts">
import SvgIcon from './svg-icon.vue';
defineOptions({ name: 'TipIcon' });

interface TipIconProps {
  onClick?: (e?: MouseEvent) => void;
  icon: string;
  confirm?: string;
}

const props = defineProps<TipIconProps>();
</script>
