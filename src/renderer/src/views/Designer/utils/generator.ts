import antDesignComponentTypes from './antDesignComponentTypes'

// 组件映射表：element-plus => antd
const vueToAntdMap: Record<string, string> = {
  'el-input': 'Input',
  'el-select': 'Select',
  'el-button': 'Button',
  'el-radio-group': 'Radio.Group',
  'el-form': 'Form',
  'el-tabs': 'Tabs',
  'el-table': 'Table',
  'label': 'span',
}

function reactAttrsToString(props: Record<string, any>, type: string) {
  // 处理props为react风格
  const parts: string[] = []
  for (const k in props) {
    const v = props[k]
    if (v === undefined || v === null) continue
    if (k === 'text' || k === 'buttonText') continue // 作为children
    if (k === 'size' && ['Input','Select','Button'].includes(vueToAntdMap[type] || type)) {
      // antd size: large | middle | small
      let size = v
      if (size === 'default') size = 'middle'
      parts.push(`size=\"${size}\"`)
      continue
    }

    if (type === 'el-tabs') {
      if (Array.isArray(v)) {
        const items: any[] = []
        v.forEach((val) => {
          items.push({ key: val, label: val })
        })
        parts.push(`items={${JSON.stringify(items)}}`)
      }
    } else {
      if (typeof v === 'string') {
        parts.push(`${k}=\"${v}\"`)
      } else if (Array.isArray(v)) {
        parts.push(`${k}={${JSON.stringify(v)}}`)
      } else if (typeof v === 'object') {
        parts.push(`${k}={${JSON.stringify(v)}}`)
      } else {
        parts.push(`${k}={${String(v)}}`)
      }
    }
  }
  return parts.join(' ')
}

export function generateReactSFC(blocks: any[]) {
  // blocks结构同vue导出
  const usedAntd = new Set<string>()

  function cssKeyToCamel(k: string) {
    return k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  }

  function styleObjToReactLiteral(style: Record<string,string> | undefined) {
    if (!style) return '{}'
    const parts: string[] = []
    for (const [k, v] of Object.entries(style)) {
      const key = cssKeyToCamel(k)
      // quote the value
      parts.push(`${key}: '${v}'`)
    }
    if (parts.length === 0) {
      return '{}'
    }
    return `{ ${parts.join(', ')} }`
  }

  const blockParts: string[] = []
  for (const block of blocks) {
    const nodeParts: string[] = []
    for (const node of (block.components || [])) {
    const antdType = vueToAntdMap[node.type] || node.type
    // if mapped to antd root like 'Radio.Group', import root 'Radio'
    const importRoot = antdType.includes('.') ? antdType.split('.')[0] : antdType
    if (antDesignComponentTypes.includes(importRoot)) usedAntd.add(importRoot)
      const nodeStyleObj: Record<string,string> = {}
      if (node.props?.width) nodeStyleObj.width = node.props.width
      if (node.props?.height) nodeStyleObj.height = node.props.height
      if (node.props?.background) nodeStyleObj.background = node.props.background
      const nodeStyleLiteral = styleObjToReactLiteral(nodeStyleObj)
      const compProps = { ...(node.props || {}) }
      delete compProps.width
      delete compProps.height
      delete compProps.background

      let children = ''
      if (antdType === 'Button') {
        children = node.props.text || node.props.buttonText || '按钮'
      } else if (antdType === 'Input' || antdType === 'Select') {
        // antd Input/Select无children
        children = ''
      } else if (antdType === 'span') {
        children = node.props.text || ''
      }

      const nodeStyleAttr = nodeStyleLiteral !== '{}' ? ` style={${nodeStyleLiteral}}` : ''
      nodeParts.push(`<div className=\"node-item\"${nodeStyleAttr}>
          <${antdType} ${reactAttrsToString(compProps, node.type)}>
            ${children}
          </${antdType}>
      </div>`)
    }
    const blockStyleLiteral = styleObjToReactLiteral(block.style)
    const blockStyleAttr = blockStyleLiteral !== '{}' ? ` style={${blockStyleLiteral}}` : ''
    const blockHtml: string = `<div className=\"content-area\"${blockStyleAttr}>
      ${nodeParts.join('')}
    </div>`
    blockParts.push(blockHtml)
  }

  const jsx = `\n  <div>\n    ${blockParts.join('\n    ')}\n  </div>\n`
  // build import lines: React + used antd components
  const imports: string[] = ["import React from 'react';"]
  if (usedAntd.size > 0) {
    imports.push(`import { ${Array.from(usedAntd).join(', ')} } from 'antd';`)
  }

  const code = [
    ...imports,
    '',
    'const GeneratedComponent = () => (' + jsx + ');',
    '',
    'export default GeneratedComponent;',
    ''
  ].join('\n')
  return code
}
// generator - no runtime imports required

function attrsToString(props: Record<string, any>) {
  const parts: string[] = []
  for (const k in props) {
    const v = props[k]
    if (v === undefined || v === null) continue
    if (typeof v === 'string') {
      // escape double quotes
      parts.push(`${k}="${(v as string).replace(/\"/g, '&quot;')}"`)
    } else if (Array.isArray(v)) {
      // simple JSON binding
      parts.push(`:${k}='${JSON.stringify(v)}'`)
    } else if (typeof v === 'object') {
      parts.push(`:${k}='${JSON.stringify(v)}'`)
    } else {
      parts.push(`:${k}='${String(v)}'`)
    }
  }
  return parts.join(' ')
}

function styleObjToString(style: Record<string,string> | undefined) {
  if (!style) return ''
  return Object.entries(style).map(([k,v]) => `${k}:${v}`).join(';')
}

export function generateVueSFC(input: any) {
  // input can be flat nodes array or blocks array
  const blocks: Array<any> = Array.isArray(input) && input.length > 0 && input[0].components ? input : [{ id: 'block-0', components: input }]

  const tplParts: string[] = []

  for (const block of blocks) {
    const blockStyle = styleObjToString(block.style)
    const innerNodes: string[] = []

    for (const node of (block.components || [])) {
      // compute node wrapper style from node.props
      const nodeStyleObj: Record<string,string> = {}
      if (node.props?.width) nodeStyleObj.width = node.props.width
      if (node.props?.height) nodeStyleObj.height = node.props.height
      if (node.props?.background) nodeStyleObj.background = node.props.background
      const nodeStyle = styleObjToString(nodeStyleObj)

      // prepare component attrs without presentation props
      const compProps = { ...(node.props || {}) }
      delete compProps.width
      delete compProps.height
      delete compProps.background

      if (node.type === 'label') {
        innerNodes.push(`<div class="node-item" style="${nodeStyle}"><span>${node.props.text ?? ''}</span></div>`)
        continue
      }

      if (node.type === 'el-button') {
        const text = node.props.text ?? node.props.buttonText ?? '按钮'
        innerNodes.push(`<div class="node-item" style="${nodeStyle}"><el-button ${attrsToString(compProps)}>${text}</el-button></div>`)
        continue
      }

      // generic wrapped with node-item
      innerNodes.push(`<div class="node-item" style="${nodeStyle}"><${node.type} ${attrsToString(compProps)}></${node.type}></div>`)
    }

    const blockHtml = `<div class="content-area" style="${blockStyle}">
      <div class="nodes">
        ${innerNodes.join('')}
      </div>
    </div>`
    tplParts.push(blockHtml)
  }

  const script = `<script setup lang="ts">\n// generated by low-code\n</script>`

  const style = `<style scoped>\n.content-area { padding:12px }\n.node-item { margin-bottom:8px }\n</style>`

  const template = `<template>\n  <div>\n    ${tplParts.join('\n    ')}\n  </div>\n</template>`

  return `${template}\n\n${script}\n\n${style}`
}
