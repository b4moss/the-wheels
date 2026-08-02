<script setup lang="ts">
import Button from '~/components/ui/button/Button.vue'
import ColorTip from '~/components/ui/color-tip/ColorTip.vue'
import type { ComboBoxOption } from '~/types/app/combobox'

const props = defineProps<{
  options: ComboBoxOption[]
  colorTipSize: number
  showClearButton: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', value: string | number, event: MouseEvent): void
  (e: 'clear', event: MouseEvent): void
}>()

const handleRemove = (value: string | number, event: MouseEvent) => {
  emit('remove', value, event)
}

const handleClear = (event: MouseEvent) => {
  emit('clear', event)
}
</script>

<template>
  <div class="combobox-tags">
    <span
      v-for="option in options"
      :key="option.value"
      class="combobox-tag"
    >
      <ColorTip
        v-if="option.primaryColor"
        :primary-color="option.primaryColor"
        :secondary-color="option.secondaryColor ?? undefined"
        :size="colorTipSize"
      />
      <span>{{ option.label }}</span>
      <Button
        type="button"
        size="icon"
        class="button-ghost combobox-tag-remove min-w-0 w-auto h-auto p-0.5"
        @click.stop="handleRemove(option.value, $event)"
      >
        ×
      </Button>
    </span>
    <Button
      v-if="showClearButton"
      type="button"
      size="sm"
      class="button-ghost combobox-clear-all min-w-0"
      @click.stop="handleClear"
    >
      すべてクリア
    </Button>
  </div>
</template>

