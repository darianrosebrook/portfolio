import React from 'react';

import './CodeBlockComponent.css';

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
  </NodeViewWrapper>
);
export default codeBlock as never;
