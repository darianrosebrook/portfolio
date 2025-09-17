'use client';

import React from 'react';
import { DocSection } from './DocLayout';
import styles from './ComponentDocTemplate.module.scss';

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
    <article className={styles.componentDoc}>
      {/* Overview Section */}
      <DocSection id="overview">
        <header className={styles.componentHeader}>
          <div className={styles.componentMeta}>
            <span className={styles.layerBadge} data-layer={component.layer}>
              {layerLabel}
            </span>
            {component.metaPatterns && (
              <div className={styles.metaPatterns}>
                {component.metaPatterns.map((pattern) => (
                  <span key={pattern} className={styles.metaPattern}>
                    {pattern}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h1 className={styles.componentTitle}>{component.name}</h1>
          <p className={styles.componentDescription}>{component.description}</p>
        </header>

        <div className={styles.overviewGrid}>
          <div className={styles.overviewSection}>
            <h3>When to use</h3>
            <ul>
              {sections.overview.whenToUse.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.overviewSection}>
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
        <div className={styles.apiSection}>
          <h3>Props</h3>
          <div className={styles.propsTable}>
            <div className={styles.propsHeader}>
              <span>Name</span>
              <span>Type</span>
              <span>Description</span>
              <span>Default</span>
            </div>
            {sections.api.props.map((prop) => (
              <div key={prop.name} className={styles.propRow}>
                <code className={styles.propName}>
                  {prop.name}
                  {prop.required && <span className={styles.required}>*</span>}
                </code>
                <code className={styles.propType}>{prop.type}</code>
                <span className={styles.propDescription}>
                  {prop.description}
                </span>
                <code className={styles.propDefault}>
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
        <div className={styles.structureSection}>
          <div className={styles.folderStructure}>
            <h3>
              Folder: <code>{component.folder}</code>
            </h3>
            <div className={styles.fileTree}>
              {sections.structure.files.map((file) => (
                <div key={file.name} className={styles.fileItem}>
                  <span className={styles.fileName} data-type={file.type}>
                    {file.name}
                  </span>
                  <span className={styles.fileDescription}>
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
        <div className={styles.accessibilitySection}>
          <div className={styles.a11yGrid}>
            <div className={styles.a11ySection}>
              <h3>Key considerations</h3>
              <ul>
                {sections.accessibility.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>

            <div className={styles.a11ySection}>
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
        <div className={styles.usageSection}>
          <h3>Basic example</h3>
          <pre className={styles.codeBlock}>
            <code>{sections.usage.basic}</code>
          </pre>

          {sections.usage.variations && (
            <div className={styles.variations}>
              <h3>Variations</h3>
              {sections.usage.variations.map((variation, index) => (
                <div key={index} className={styles.variation}>
                  <h4>{variation.title}</h4>
                  <p>{variation.description}</p>
                  <pre className={styles.codeBlock}>
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
        <div className={styles.tokensSection}>
          <p>{sections.tokens.description}</p>

          {sections.tokens.categories.map((category) => (
            <div key={category.name} className={styles.tokenCategory}>
              <h3>{category.name}</h3>
              <div className={styles.tokenGrid}>
                {category.tokens.map((token) => (
                  <div key={token.name} className={styles.tokenItem}>
                    <code className={styles.tokenName}>{token.name}</code>
                    <code className={styles.tokenValue}>{token.value}</code>
                    {token.description && (
                      <span className={styles.tokenDescription}>
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
