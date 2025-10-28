<script setup lang="ts">
const items = [
  { type: 'el-input', title: 'Input' },
  { type: 'el-select', title: 'Select' },
  { type: 'el-button', title: 'Button' },
  { type: 'el-tag', title: 'Tag' },
  { type: 'el-radio-group', title: 'Radio Group' },
  { type: 'el-form', title: 'Form' },
  { type: 'el-tabs', title: 'Tabs' },
  { type: 'el-table', title: 'Table' },
  { type: 'BlankDiv', title: 'Blank Div' },
  { type: 'TitleComp', title: 'TitleComp' }
]

function onDragStart(e: DragEvent, type: string) {
  e.dataTransfer?.setData('application/x-lowcode-comp', type)
}
</script>

<template>
  <div class="palette-root">
    <h3>组件列表</h3>
    <div class="comp-list">
      <div
        v-for="it in items"
        :key="it.type"
        class="comp-item"
        draggable="true"
        @dragstart="(e) => onDragStart(e, it.type)"
      >
        {{ it.title }} ({{ it.type }})
      </div>
    </div>
  </div>
</template>

<style scoped>
.palette-root { font-size: 14px }
.comp-list { margin-top: 8px; display:flex; flex-direction:column; gap:8px }
.comp-item { padding:8px; border:1px dashed #ddd; border-radius:4px; background:#fff; cursor:grab }
</style>
