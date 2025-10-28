<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useCanvasStore } from '../../stores/useCanvasStore'

const store = useCanvasStore()

const selected = computed(() => store.state.components.find(c => c.id === store.state.selectedId) || null)

const local = reactive({}) as Record<string, any>

const editingBlock = computed(() => store.state.blocks.find((b: any) => b.id === store.state.editingBlockId) || null)

watch(selected, (v) => {
  // copy props into local reactive object and ensure size/width/height defaults exist
  if (v) {
    for (const k in v.props) {
      local[k] = v.props[k]
    }
    // ensure size exists for inputs/selects/buttons
    if (['el-input', 'el-select', 'el-button'].includes(v.type)) {
      if (local.size === undefined) local.size = 'default'
    }
    // for input/select ensure width/height defaults
    if (['el-input', 'el-select'].includes(v.type)) {
      if (!local.width) local.width = local.width ?? '200px'
      if (!local.height) local.height = local.height ?? '36px'
    }
  } else {
    for (const k in local) delete local[k]
  }
})

// watch editing block style
watch(editingBlock, (b) => {
  if (b) {
    // copy block style into local
    for (const k in b.style) local[k] = b.style[k]
    // provide defaults
    if (!local.width) local.width = '100%'
    if (!local.height) local.height = local.height ?? ''
    if (!local.border) local.border = local.border ?? '1px dashed #dcdcdc'
    if (!local.background) local.background = local.background ?? ''
  } else {
    // when leaving block editing, clear block-related keys from local
    for (const k of ['width','height','border','background']) delete local[k]
  }
})

const filteredProps = computed(() => {
  if (!selected.value) return [] as Array<[string, any]>
  return Object.entries(selected.value.props).filter(([k]) => !['size', 'width', 'height'].includes(k))
})

function apply() {
  if (!selected.value) return
  store.updateComponent(selected.value.id, { ...local })
}

function remove() {
  if (!selected.value) return
  store.removeComponent(selected.value.id)
}

function applyBlockStyle() {
  if (!editingBlock.value) return
  store.updateBlockStyle(editingBlock.value.id, { ...(local as Record<string, any>) })
}

function cancelEditBlock() {
  store.setEditingBlock('')
}
</script>

<template>
  <div class="props-root">
    <h3>属性设置</h3>

    <template v-if="editingBlock">
      <div class="meta">编辑区块样式: {{ editingBlock.id }}</div>
      <div class="fields">
        <div class="field">
          <label class="field-label">宽度</label>
          <el-input v-model="local.width" size="small" placeholder="e.g. 100% or 800px" />
        </div>
        <div class="field">
          <label class="field-label">高度</label>
          <el-input v-model="local.height" size="small" placeholder="e.g. 400px" />
        </div>
        <div class="field">
          <label class="field-label">边框</label>
          <el-input v-model="local.border" size="small" placeholder="e.g. 1px solid #ddd" />
        </div>
        <div class="field">
          <label class="field-label">背景</label>
          <el-input v-model="local.background" size="small" placeholder="css color or image" />
        </div>
      </div>
      <div style="margin-top:12px; display:flex; gap:8px">
        <el-button size="small" type="primary" @click="applyBlockStyle">应用样式</el-button>
        <el-button size="small" @click="cancelEditBlock">取消</el-button>
      </div>
    </template>

    <template v-else-if="selected">
      <div class="meta">类型: {{ selected.type }}  | id: {{ selected.id }}</div>

      <div class="fields">
        <div class="field">
          <label class="field-label">大小</label>
          <el-select v-model="local.size" size="small" placeholder="size" style="width:140px">
            <el-option label="default" value="default" />
            <el-option label="small" value="small" />
            <el-option label="large" value="large" />
          </el-select>
        </div>

        <div class="field">
          <label class="field-label">宽度</label>
          <el-input v-model="local.width" size="small" placeholder="200px" />
        </div>

        <div class="field">
          <label class="field-label">高度</label>
          <el-input v-model="local.height" size="small" placeholder="36px" />
        </div>

        <!-- render other props except size/width/height -->
        <div v-for="([key, val]) in filteredProps" :key="key" class="field">
          <template v-if="!['parentNodeWidthIsFull'].includes(key)">
            <label class="field-label">{{ key }}</label>
            <el-input v-if="typeof val === 'string'" v-model="local[key]" size="small" />
            <el-input v-else-if="Array.isArray(val)" v-model="local[key]" size="small" />
            <el-input v-else v-model="local[key]" size="small" />
          </template>
        </div>
      </div>

      <div style="margin-top:12px; display:flex; gap:8px">
        <el-button size="small" type="primary" @click="apply">应用</el-button>
        <el-button size="small" type="danger" @click="remove">删除</el-button>
      </div>
    </template>

    <template v-else>
      <div>请选择画布上的组件</div>
    </template>

  </div>
</template>

<style scoped>
.props-root { font-size:14px }
.meta { color:#666; margin-bottom:8px }
.field { display:flex; align-items:center; gap:8px; margin-bottom:8px }
.field-label { width:90px; color:#333 }
</style>
