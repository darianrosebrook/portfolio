'use client';

import React from 'react';
import { DocSection } from './DocLayout';
import './ComponentDocTemplate.css';

export interface ComponentDocTemplateProps {
  component: {
    name: string;
    layer: 'primitive' | 'compound' | 'composer';
    description: string;
    metaPatterns?: string[];
    folder: string;
  };
  sections: {
    overview: {
      description: string;
      whenToUse: string[];
      keyIdeas: string[];
    };
    api: {
      props: Array<{
        name: string;
        type: string;
        description: string;
        required?: boolean;
        default?: string;
      }>;
      examples: string[];
    };
    structure: {
      files: Array<{
        name: string;
        description: string;
        type: 'component' | 'hook' | 'context' | 'types' | 'styles' | 'tokens';
      }>;
    };
    accessibility: {
      notes: string[];
      patterns: string[];
    };
    usage: {
      basic: string;
      advanced?: string;
      variations?: Array<{
        title: string;
        description: string;
        code: string;
      }>;
    };
    tokens: {
      description: string;
      categories: Array<{
        name: string;
        tokens: Array<{
          name: string;
          value: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export function ComponentDocTemplate({
  component,
  sections,
}: ComponentDocTemplateProps) {
  const layerLabel =
    component.layer.charAt(0).toUpperCase() + component.layer.slice(1);

  return (
    <article data-ds-component="ComponentDocTemplate" className='componentDoc'>
      {/* Overview Section */}
      <DocSection id="overview">
        <header className='componentHeader'>
          <div className='componentMeta'>
            <span className='layerBadge' data-layer={component.layer}>
              {layerLabel}
            </span>
            {component.metaPatterns && (
              <div className='metaPatterns'>
                {component.metaPatterns.map((pattern) => (
                  <span key={pattern} className='metaPattern'>
                    {pattern}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h1 className='componentTitle'>{component.name}</h1>
          <p className='componentDescription'>{component.description}</p>
        </header>

        <div className='overviewGrid'>
          <div className='overviewSection'>
            <h3>When to use</h3>
            <ul>
              {sections.overview.whenToUse.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className='overviewSection'>
            <h3>Key ideas</h3>
            <ul>
              {sections.overview.keyIdeas.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </DocSection>

      {/* API Section */}
      <DocSection id="api">
        <h2>API</h2>
        <div className='apiSection'>
          <h3>Props</h3>
          <div className='propsTable'>
            <div className='propsHeader'>
              <span>Name</span>
              <span>Type</span>
              <span>Description</span>
              <span>Default</span>
            </div>
            {sections.api.props.map((prop) => (
              <div key={prop.name} className='propRow'>
                <code className='propName'>
                  {prop.name}
                  {prop.required && <span className='required'>*</span>}
                </code>
                <code className='propType'>{prop.type}</code>
                <span className='propDescription'>
                  {prop.description}
                </span>
                <code className='propDefault'>
                  {prop.default || '—'}
                </code>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      {/* Structure Section */}
      <DocSection id="structure">
        <h2>Structure</h2>
        <div className='structureSection'>
          <div className='folderStructure'>
            <h3>
              Folder: <code>{component.folder}</code>
            </h3>
            <div className='fileTree'>
              {sections.structure.files.map((file) => (
                <div key={file.name} className='fileItem'>
                  <span className='fileName' data-type={file.type}>
                    {file.name}
                  </span>
                  <span className='fileDescription'>
                    {file.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* Accessibility Section */}
      <DocSection id="accessibility">
        <h2>Accessibility</h2>
        <div className='accessibilitySection'>
          <div className='a11yGrid'>
            <div className='a11ySection'>
              <h3>Key considerations</h3>
              <ul>
                {sections.accessibility.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>

            <div className='a11ySection'>
              <h3>Patterns implemented</h3>
              <ul>
                {sections.accessibility.patterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DocSection>

      {/* Usage Section */}
      <DocSection id="usage">
        <h2>Usage</h2>
        <div className='usageSection'>
          <h3>Basic example</h3>
          <pre className='codeBlock'>
            <code>{sections.usage.basic}</code>
          </pre>

          {sections.usage.variations && (
            <div className='variations'>
              <h3>Variations</h3>
              {sections.usage.variations.map((variation, index) => (
                <div key={index} className='variation'>
                  <h4>{variation.title}</h4>
                  <p>{variation.description}</p>
                  <pre className='codeBlock'>
                    <code>{variation.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </DocSection>

      {/* Tokens Section */}
      <DocSection id="tokens">
        <h2>Design Tokens</h2>
        <div className='tokensSection'>
          <p>{sections.tokens.description}</p>

          {sections.tokens.categories.map((category) => (
            <div key={category.name} className='tokenCategory'>
              <h3>{category.name}</h3>
              <div className='tokenGrid'>
                {category.tokens.map((token) => (
                  <div key={token.name} className='tokenItem'>
                    <code className='tokenName'>{token.name}</code>
                    <code className='tokenValue'>{token.value}</code>
                    {token.description && (
                      <span className='tokenDescription'>
                        {token.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocSection>
    </article>
  );
}
