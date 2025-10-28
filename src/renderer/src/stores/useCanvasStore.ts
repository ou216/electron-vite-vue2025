import { defineStore } from 'pinia'
import { reactive } from 'vue'

export type CanvasNode = {
  id: string
  type: string
  props: Record<string, any>
}

export const useCanvasStore = defineStore('canvas', () => {
  const state = reactive({
    components: [] as CanvasNode[],
    // blocks contain grouped components; each block has id and its own components
    blocks: [{ id: 'block-' + Date.now().toString(36), components: [] as CanvasNode[], style: {} as Record<string,string> }],
    editingBlockId: '' as string,
    selectedId: '' as string
  })

  function addComponent(type: string, blockId?: string) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
    const defaults: Record<string, any> = {
      // set default size and sizing for input/select/button
      'el-input': { placeholder: '请输入', size: 'default', width: '200px', height: '36px' },
      'el-select': { placeholder: '请选择', size: 'default', width: '200px', height: '36px' },
      'el-button': { buttonText: '按钮', size: 'default' },
      'el-tag': { size: 'medium', text: '标签' },
      'el-radio-group': { options: ['选项1','选项2'] },
      'el-form': { label: '表单' },
      'el-tabs': { panes: ['Tab1','Tab2'], type: 'card' },
      'el-table': { columns: ['列1','列2'], data: [] },
      'BlankDiv': { parentNodeWidthIsFull: true, width: '100%', height: '10px', background: '#ffffff' },
      'TitleComp': { parentNodeWidthIsFull: true }
    }

    const node: CanvasNode = { id, type, props: defaults[type] || {} }
    // push to global flat list
    state.components.push(node)
    // also push to block if provided
    if (blockId) {
      const b = state.blocks.find((x: any) => x.id === blockId)
      if (b) b.components.push(node)
    } else {
      // default to first block
      state.blocks[0].components.push(node)
    }
    state.selectedId = id
    return node
  }

  function addBlock(afterBlockId?: string) {
    const id = 'block-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6)
    const block = { id, components: [] as CanvasNode[], style: {} as Record<string,string> }
    if (!afterBlockId) {
      state.blocks.push(block)
    } else {
      const idx = state.blocks.findIndex((b: any) => b.id === afterBlockId)
      if (idx === -1) state.blocks.push(block)
      else state.blocks.splice(idx + 1, 0, block)
    }
    return block
  }

  function removeBlock(blockId: string) {
    const idx = state.blocks.findIndex((b: any) => b.id === blockId)
    if (idx === -1) return
    // remove its components from flat list
    const compIds = state.blocks[idx].components.map((c: CanvasNode) => c.id)
    state.components = state.components.filter(c => !compIds.includes(c.id))
    // if selected component was in the removed block clear selection
    if (compIds.includes(state.selectedId)) state.selectedId = ''
    state.blocks.splice(idx, 1)
    // ensure at least one block remains
    if (state.blocks.length === 0) state.blocks.push({ id: 'block-' + Date.now().toString(36), components: [], style: {} })
  }

  function setEditingBlock(blockId?: string) {
    state.editingBlockId = blockId || ''
  }

  function updateBlockStyle(blockId: string, style: Record<string,string>) {
    const b = state.blocks.find((x: any) => x.id === blockId)
    if (!b) return
    b.style = { ...(b.style || {}), ...(style || {}) }
  }

  function updateComponent(id: string, props: Record<string, any>) {
    const idx = state.components.findIndex(c => c.id === id)
    if (idx >= 0) {
      state.components[idx].props = { ...state.components[idx].props, ...props }
    }
  }

  function selectComponent(id: string) {
    state.selectedId = id
  }

  function removeComponent(id: string) {
    // remove from flat list
    state.components = state.components.filter(c => c.id !== id)
    // remove from any block that contains it
    for (const b of state.blocks) {
      if (!b.components) continue
      b.components = b.components.filter((c: CanvasNode) => c.id !== id)
    }
    if (state.selectedId === id) state.selectedId = ''
  }

  function clear() {
    state.components = []
    state.selectedId = ''
  }

  return { state, addComponent, updateComponent, selectComponent, removeComponent, clear, addBlock, removeBlock, setEditingBlock, updateBlockStyle }
})
