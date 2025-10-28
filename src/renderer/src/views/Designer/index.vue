<script setup lang="ts">
import { ref } from 'vue'
import ComponentPalette from './ComponentPalette.vue'
import LowcodeCanvas from './LowcodeCanvas.vue'
import PropertyPanel from './PropertyPanel.vue'
import { useCanvasStore } from '../../stores/useCanvasStore'
import { generateVueSFC, generateReactSFC } from './utils/generator'
import Preview from './Preview.vue'

const store = useCanvasStore()
const showPreview = ref(false)

function onPreviewToggle() {
  showPreview.value = !showPreview.value
}

function onExportComponent(suffix: string) {
  const isVue = suffix === 'vue'
  const tsx = isVue ? generateVueSFC(store.state.blocks) : generateReactSFC(store.state.blocks)
  const blob = new Blob([tsx], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `GeneratedComponent.${suffix}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="export-preview">
    <el-button size="small" type="primary" @click="onExportComponent('vue')">导出vue组件</el-button>
    <el-button size="small" type="primary" @click="onExportComponent('tsx')">导出react组件</el-button>
    <el-button size="small" @click="onPreviewToggle">预览</el-button>
  </div>
  <div class="lowcode-root">
    <aside class="palette">
      <ComponentPalette />
    </aside>

    <main class="canvas">
      <LowcodeCanvas />
    </main>

    <aside class="props">
      <PropertyPanel />
    </aside>
  </div>
  <Preview v-if="showPreview" @on-close="onPreviewToggle" />
</template>

<style scoped>
.export-preview {
  width: 100%;
  background: #f0f0f0;
}
.lowcode-root {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 5fr minmax(250px, 1fr);
  height: 100vh;
  gap: 12px;
  box-sizing: border-box;
  max-width: 100vw;
}
.palette {
  border-right: 1px solid #e6e6e6;
  padding: 12px;
  overflow: auto;
}
.canvas {
  position: relative;
  padding: 12px;
  background: #fafafa;
  overflow: auto;
}
.props {
  border-left: 1px solid #e6e6e6;
  padding: 12px;
  overflow: auto;
}
</style>
