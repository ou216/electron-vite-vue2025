<script setup lang="ts">
import {type CanvasNode, useCanvasStore} from "../../stores/useCanvasStore"

const store = useCanvasStore()

const emit = defineEmits(['onClose'])

function onClose(): void {
  emit('onClose')
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
</script>

<template>
  <div class="preview-modal" @click.self="onClose">
    <div class="preview-content">
      <div class="preview-header">
        <h3>Preview</h3>
        <el-button size="small" @click="onClose">关闭</el-button>
      </div>
      <template v-for="block in store.state.blocks" :key="block.id">
        <div class="preview-content-area" :style="block.style">
          <div
            v-for="node in block.components"
            :key="node.id"
            class="preview-node-item"
            :style="{ width: ['el-tabs'].includes(node.type) ? '99%' : '' }"
          >
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
      </template>
    </div>
  </div>
</template>

<style scoped>
.preview-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.preview-content {
  width: 80%;
  height: 100%;
  background: white;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eeeeee
}
.preview-content-area {
  min-height: 100px;
  background: #fff;
  padding: 12px;
  text-align: left
}
.preview-node-item {
  display: inline-block;
  padding: 8px;
  border: 1px solid transparent
}
</style>
