<script setup lang="ts">
import { onMounted } from 'vue'
import { useCanvasStore } from '../../stores/useCanvasStore'
import type { CanvasNode } from '../../stores/useCanvasStore'

const store = useCanvasStore()
// container ref removed (not used)

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(e: DragEvent, blockId?: string) {
  e.preventDefault()
  const type = e.dataTransfer?.getData('application/x-lowcode-comp')
  if (type) {
    store.addComponent(type, blockId)
  }
}

function onSelect(nodeId: string) {
  store.selectComponent(nodeId)
}

function getBindProps(node: CanvasNode) {
  const props = { ...(node.props || {}) }
  // remove presentation props so they don't become unknown component props
  delete props.width
  delete props.height
  return props
}

function getStyle(node: CanvasNode) {
  const style: Record<string, string | undefined> = {}
  if (node.props?.width) style.width = node.props.width
  if (node.props?.height) style.height = node.props.height
  if (node.props?.background) style.background = node.props.background
  return style
}

function addBlock(afterId?: string) {
  store.addBlock(afterId)
}

function deleteBlock(blockId: string) {
  store.removeBlock(blockId)
}

onMounted(() => {
  // nothing for now
})
</script>

<template>
  <div class="canvas-root">
    <template v-for="block in store.state.blocks" :key="block.id">
      <div
        class="content-area"
        @dragover.prevent="onDragOver"
        @drop.prevent="(e) => onDrop(e, block.id)"
        :style="block.style"
      >
        <div v-if="block.components.length === 0" class="canvas-hint">将组件拖拽到此处</div>
        <div
          v-for="node in block.components"
          :key="node.id"
          class="node-item"
          :class="{ selected: store.state.selectedId === node.id }"
          :style="{ width: ['el-tabs'].includes(node.type) ? '99%' : '' }"
          @click.stop="onSelect(node.id)"
        >
          <!---->
          <component
            v-if="node.type !== 'label'"
            :is="node.type"
            v-bind="getBindProps(node)"
            :style="getStyle(node)"
          >
            <template v-if="node.type === 'el-button'">
              {{ node.props.buttonText }}
            </template>
            <template v-if="node.type === 'el-tabs'">
              <el-tab-pane :label="item" :name="item" v-for="item in node.props.panes">{{ item }}</el-tab-pane>
            </template>
            <template v-if="node.type === 'el-radio-group'">
              <el-radio :label="item" v-for="item in node.props.options">{{ item }}</el-radio>
            </template>
            <template v-if="['el-tag'].includes(node.type)">
              {{ node.props.text }}
            </template>
          </component>
          <div v-else class="label-node">{{ node.props.text }}</div>
        </div>
      </div>

      <div class="block-controls">
        <el-button size="small" type="primary" @click="addBlock(block.id)">添加区块</el-button>
        <el-button v-if="store.state.blocks.length > 1" size="small" type="danger" @click="deleteBlock(block.id)">删除区块</el-button>
        <el-button size="small" @click="() => store.setEditingBlock(block.id)">编辑区块style</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.canvas-root { position:relative; height:100%; }
.content-area { min-height: 100px; border:1px dashed #dcdcdc; border-radius:6px; background:#fff; padding:12px; text-align: left }
.canvas-hint { color:#999; text-align:center; padding:28px }
.node-item { display: inline-block; padding:8px; border:1px solid transparent }
.node-item.selected { border-color:#409eff; box-shadow:0 0 0 3px rgba(64,158,255,0.08) }
.label-node { padding:4px 8px; background:#f5f5f5; border-radius:4px }
</style>
