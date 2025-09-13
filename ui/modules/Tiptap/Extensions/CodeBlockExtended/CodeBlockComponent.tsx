import React from 'react';

// Inline minimal styles to avoid external CSS imports

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

interface CodeBlockProps {
  node: {
    attrs: { language: string };
  };
  updateAttributes: (attrs: { language: string }) => void;
  extension: {
    options: {
      lowlight: {
        listLanguages: () => string[];
      };
    };
  };
}

const codeBlock: React.FC<CodeBlockProps> = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}) => (
  <NodeViewWrapper className="code-block">
    <select
      contentEditable={false}
      defaultValue={defaultLanguage}
      onChange={(event) => updateAttributes({ language: event.target.value })}
    >
      <option value="null">auto</option>
      <option disabled>—</option>
      {extension.options.lowlight
        .listLanguages()
        .map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
    </select>
    <pre>
      <NodeViewContent />
    </pre>
    <style jsx>{`
      .code-block select {
        margin-bottom: 8px;
        padding: 4px 6px;
        border: 1px solid var(--semantic-color-border-primary);
        border-radius: var(--core-shape-radius-medium);
        background: var(--semantic-color-background-secondary);
        color: var(--color-text-primary);
      }
      .code-block pre {
        background: var(--semantic-color-background-tertiary);
        border: 1px solid var(--semantic-color-border-primary);
        border-radius: var(--core-shape-radius-medium);
        padding: var(--core-spacing-size-04);
        overflow-x: auto;
      }
    `}</style>
  </NodeViewWrapper>
);
export default codeBlock as never;
