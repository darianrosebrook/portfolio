import React from 'react'

import './CodeBlockComponent.css'

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const codeBlock = ({ node: { attrs: { language: defaultLanguage } }, updateAttributes, extension } ) => (
  <NodeViewWrapper className="code-block">
    <select contentEditable={false} defaultValue={defaultLanguage} onChange={event => updateAttributes({ language: event.target.value })}>
      <option value="null">
        auto
      </option>
      <option disabled>
        —
      </option>
      {extension.options.lowlight.listLanguages().map((lang, index) => (
        <option key={index} value={lang}>
          {lang}
        </option>
      ))}
    </select>
    <pre>
      <NodeViewContent as="code" />
    </pre>
  </NodeViewWrapper>
)
export default codeBlock as never