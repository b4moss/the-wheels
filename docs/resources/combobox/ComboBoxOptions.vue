<script setup lang="ts">
import Avatar from '~/components/ui/avatar/Avatar.vue'
import ColorTip from '~/components/ui/color-tip/ColorTip.vue'
import type { ComboBoxOption } from '~/types/app/combobox'

const props = defineProps<{
  options: ComboBoxOption[]
  selectedValues: (string | number)[]
  highlightedIndex: number
  columns: 1 | 2 | 3
  leftDisplay: 'colorTip' | 'avatar'
  colorTipSize: number
}>()

const emit = defineEmits<{
  (e: 'select', option: ComboBoxOption): void
}>()

const handleSelect = (option: ComboBoxOption) => {
  emit('select', option)
}
</script>

<template>
  <ul
    class="combobox-options"
    :class="{
      'combobox-options--cols-2': columns === 2,
      'combobox-options--cols-3': columns === 3,
    }"
  >
    <li
      v-for="(option, index) in options"
      :key="option.value"
      class="combobox-option"
      :class="{
        'combobox-option-selected': selectedValues.includes(option.value),
        'combobox-option-highlighted': index === highlightedIndex,
        'combobox-option-disabled': option.disabled,
        'combobox-option--multi-col': columns > 1,
      }"
      role="option"
      @click="handleSelect(option)"
    >
      <Avatar
        v-if="leftDisplay === 'avatar'"
        :icon="option.iconUrl ?? undefined"
        :name="option.label"
        :primary-color="option.primaryColor ?? undefined"
        :secondary-color="option.secondaryColor ?? undefined"
        :split-line-color="option.splitLineColor ?? undefined"
        class="combobox-option-avatar"
      />
      <ColorTip
        v-else
        :primary-color="option.primaryColor ?? '#94a3b8'"
        :secondary-color="option.secondaryColor ?? undefined"
        :split-line-color="option.splitLineColor ?? undefined"
        :size="colorTipSize"
      />
      <span class="combobox-option-label">{{ option.label }}</span>
      <span v-if="selectedValues.includes(option.value)" class="combobox-check">
        ✓
      </span>
    </li>
    <li v-if="options.length === 0" class="combobox-empty">
      該当する項目がありません
    </li>
  </ul>
</template>

