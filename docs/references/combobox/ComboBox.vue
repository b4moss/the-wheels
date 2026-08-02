<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, useSlots, type Ref } from 'vue'
import Button from '~/components/ui/button/Button.vue'
import ColorTip from '~/components/ui/color-tip/ColorTip.vue'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import ComboBoxTagList from '~/components/ui/combobox/ComboBoxTagList.vue'
import ComboBoxOptions from '~/components/ui/combobox/ComboBoxOptions.vue'
import { useDropdown } from '~/composables/useDropdown'
import { useComboboxPosition } from '~/composables/combobox/useComboboxPosition'
import { useComboboxState } from '~/composables/combobox/useComboboxState'
import type { ComboBoxCategory, ComboBoxOption, LoadOptionsFn } from '~/types/app/combobox'

interface Props {
  modelValue: string | number | null | (string | number)[]
  multiple?: boolean
  maxSelected?: number
  options?: ComboBoxOption[]
  loadOptions?: LoadOptionsFn
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  /** ColorTip のサイズ（px）。leftDisplay='colorTip' のとき使用 */
  colorTipSize?: number
  /** トリガー・オプション左の表示。colorTip: カラーチップ、avatar: Avatar（iconUrl/primaryColor 使用） */
  leftDisplay?: 'colorTip' | 'avatar'
  /** カテゴリー絞り込み用のカテゴリーリスト */
  categories?: ComboBoxCategory[]
  /** カテゴリー絞り込み機能の有効/無効 */
  enableCategoryFilter?: boolean
  /** オープン時にテキストフィールドへ自動フォーカスするか（タッチデバイス向けにデフォルト false） */
  autoFocus?: boolean
  /** 選択をクリアするボタンを表示するか */
  clearable?: boolean
  /** オプションリストのカラム数（1: 1列、2: 2列、3: 3列） */
  columns?: 1 | 2 | 3
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  searchable: true,
  disabled: false,
  colorTipSize: 14,
  leftDisplay: 'colorTip',
  enableCategoryFilter: false,
  autoFocus: false,
  clearable: false,
  columns: 1,
})

const slots = useSlots()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null | (string | number)[]): void
  (e: 'search', query: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const {
  contentStyles,
  updatePosition,
  attachPositionListeners,
  detachPositionListeners,
} = useComboboxPosition(triggerRef, contentRef)

const { isOpen, toggle, open, close, id } = useDropdown()

const {
  searchQuery,
  loading,
  internalOptions,
  highlightedIndex,
  asyncPage,
  selectedCategoryIds,
  selectedValues,
  selectedOptions,
  filteredOptions,
  displayText,
  isContentExtended,
  showClearButton,
  canSelectMore,
  handleCategoryToggle,
  handleSelect,
  handleRemoveTag,
  handleClear,
  handleKeydown: innerHandleKeydown,
} = useComboboxState({
  props,
  emit: emit as any,
  isOpen: isOpen as Ref<boolean>,
  close,
  updatePosition,
  searchInputRef,
  slots,
})

const handleClickOutside = (e: MouseEvent) => {
  if (!isOpen.value || !containerRef.value) {
    return
  }

  const target = e.target as Node
  if (!containerRef.value.contains(target) && !contentRef.value?.contains(target)) {
    close()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
    return
  }
  innerHandleKeydown(e)
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  attachPositionListeners()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  detachPositionListeners()
})
</script>

<template>
  <div
    ref="containerRef"
    class="combobox-container"
    :class="{ 'combobox-disabled': disabled }"
  >
    <div
      ref="triggerRef"
      class="combobox-trigger"
      :class="{ 'combobox-open': isOpen, 'combobox-multiple': multiple }"
      :tabindex="disabled ? -1 : 0"
      @click="!disabled && toggle()"
      @keydown="handleKeydown"
    >
      <ComboBoxTagList
        v-if="multiple && selectedOptions.length > 0"
        :options="selectedOptions"
        :color-tip-size="colorTipSize"
        :show-clear-button="showClearButton"
        @remove="handleRemoveTag"
        @clear="handleClear"
      />
      <div v-else class="combobox-single-display combobox-single-display-inner">
        <Avatar
          v-if="leftDisplay === 'avatar' && selectedOptions[0]"
          :icon="selectedOptions[0].iconUrl ?? undefined"
          :name="selectedOptions[0].label"
          :primary-color="selectedOptions[0].primaryColor ?? undefined"
          :secondary-color="selectedOptions[0].secondaryColor ?? undefined"
          :split-line-color="selectedOptions[0].splitLineColor ?? undefined"
          class="combobox-left-avatar"
        />
        <ColorTip
          v-else-if="leftDisplay === 'colorTip' && selectedOptions[0]"
          :primary-color="selectedOptions[0].primaryColor ?? '#94a3b8'"
          :secondary-color="selectedOptions[0].secondaryColor ?? undefined"
          :split-line-color="selectedOptions[0].splitLineColor ?? undefined"
          :size="colorTipSize"
        />
        <span>{{ displayText }}</span>
      </div>
      <Button
        v-if="showClearButton && !multiple"
        type="button"
        size="icon"
        class="button-ghost combobox-clear min-w-0 w-auto h-auto p-0.5"
        @click.stop="handleClear"
      >
        ×
      </Button>
      <div class="combobox-arrow">
        ▼
      </div>
    </div>

    <Teleport to="body">
      <Transition name="combobox">
        <div
          v-show="isOpen"
          ref="contentRef"
          class="combobox-content"
          :class="{ 'combobox-content--extended': isContentExtended }"
          :style="contentStyles"
          :id="`combobox-content-${id}`"
          role="listbox"
          tabindex="-1"
        >
          <div v-if="searchable" class="combobox-search">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="combobox-search-input"
              placeholder="検索..."
              @click.stop
            >
          </div>

          <div
            v-if="enableCategoryFilter && categories?.length"
            class="combobox-categories"
          >
            <div class="combobox-categories-scroll">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                :class="[
                  'combobox-category-btn',
                  { 'combobox-category-btn--selected': selectedCategoryIds.includes(cat.id) },
                ]"
                @click.stop="handleCategoryToggle(cat.id)"
              >
                <ColorTip
                  v-if="cat.primaryColor"
                  :primary-color="cat.primaryColor"
                  :secondary-color="cat.secondaryColor ?? undefined"
                  :size="12"
                />
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="combobox-loading">
            読み込み中...
          </div>

          <ComboBoxOptions
            v-else
            :options="filteredOptions"
            :selected-values="multiple ? (selectedValues as (string | number)[]) : (selectedValues as (string | number)[])"
            :highlighted-index="highlightedIndex"
            :columns="columns"
            :left-display="leftDisplay"
            :color-tip-size="colorTipSize"
            @select="handleSelect"
          />

          <div
            v-if="multiple && maxSelected != null && !canSelectMore"
            class="combobox-limit-message"
          >
            上限（{{ maxSelected }}件）に達しました
          </div>

          <div v-if="$slots.footer" class="combobox-footer">
            <slot
              name="footer"
              :close="close"
              :search-query="searchQuery"
              :selected-values="selectedValues"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.combobox-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.combobox-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.combobox-trigger {
  display: flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
  gap: 0.5rem;
}

.combobox-trigger:hover:not(.combobox-disabled) {
  border-color: #9ca3af;
}

.combobox-trigger.combobox-open {
  border-color: #2563eb;
  outline: 2px solid rgba(37, 99, 235, 0.2);
  outline-offset: -2px;
}

.combobox-trigger:focus {
  outline: 2px solid rgba(37, 99, 235, 0.2);
  outline-offset: -2px;
}

.combobox-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
}

.combobox-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.combobox-tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  font-size: 1rem;
  line-height: 1;
  color: #6b7280;
}

.combobox-tag-remove:hover {
  color: #1f2937;
}

.combobox-clear,
.combobox-clear-all {
  flex-shrink: 0;
  color: #6b7280;
}

.combobox-clear:hover,
.combobox-clear-all:hover {
  color: #1f2937;
}

.combobox-single-display {
  flex: 1;
  text-align: left;
  color: #1f2937;
}

.combobox-single-display-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.combobox-left-avatar,
.combobox-option-avatar {
  flex-shrink: 0;
}

.combobox-option-label {
  flex: 1;
  min-width: 0;
}

.combobox-trigger:not(.combobox-multiple) .combobox-single-display {
  color: #6b7280;
}

.combobox-arrow {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.combobox-open .combobox-arrow {
  transform: rotate(180deg);
}

.combobox-content {
  position: fixed;
  top: 0;
  left: 0;
  min-width: auto;
  max-height: 20rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 12000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.combobox-content--extended {
  max-height: 26rem;
}

.combobox-search {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.combobox-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 1.2rem;
}

.combobox-search-input:focus {
  outline: none;
  border-color: #2563eb;
}

.combobox-categories {
  flex-shrink: 0;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fafafa;
  overflow: hidden;
}

.combobox-categories-scroll {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  min-width: 0;
  width: 100%;
  scrollbar-width: none;
}

.combobox-categories-scroll::-webkit-scrollbar {
  display: none;
}

.combobox-category-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  padding: 0.35em 0.75em;
  font-size: 0.8em;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  background-color: #f3f4f6;
  color: #4b5563;
}

.combobox-category-btn:hover {
  background-color: #e5e7eb;
}

.combobox-category-btn--selected {
  background-color: color-mix(in oklch, var(--theme-primary) 15%, white);
  color: var(--theme-primary);
}

.combobox-category-btn--selected:hover {
  background-color: color-mix(in oklch, var(--theme-primary) 22%, white);
}

.combobox-loading {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.2rem;
}

.combobox-options {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  overflow-y: auto;
  flex: 1;
}

.combobox-options--cols-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
}

.combobox-options--cols-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
}

.combobox-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #1f2937;
}

.combobox-option--multi-col {
  padding: 0.6rem 0.8rem;
  font-size: 1.1rem;
  line-height: 1.15;
  min-height: 2.8em;
  display: flex;
  align-items: center;
}

.combobox-option:hover:not(.combobox-option-disabled) {
  background-color: #f3f4f6;
}

.combobox-option-highlighted {
  background-color: #eff6ff;
}

.combobox-option-selected {
  background-color: #dbeafe;
  font-weight: 500;
}

.combobox-option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.combobox-check {
  color: #2563eb;
  font-weight: bold;
}

.combobox-empty {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.2rem;
}

.combobox-options--cols-2 .combobox-empty,
.combobox-options--cols-3 .combobox-empty {
  grid-column: 1 / -1;
}

.combobox-limit-message {
  padding: 0.5rem 0.75rem;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 1.1rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.combobox-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

.combobox-enter-from,
.combobox-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.combobox-enter-active,
.combobox-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
</style>
