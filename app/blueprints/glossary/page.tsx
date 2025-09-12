import { NextPage } from 'next';
import { glossaryItems, GlossaryItem } from '@/app/heroes/glossaryItems';
import Icon from '@/ui/Icon';
import React from 'react';
import Link from 'next/link';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

/**
 * Groups and sorts glossary items by their starting letter.
 * @param {GlossaryItem[]} items - The glossary items to group.
 * @returns {Record<string, GlossaryItem[]>} An object where each key is a letter and the value is an array of items starting with that letter.
 */
const groupAndSortByLetter = (
  items: GlossaryItem[]
): Record<string, GlossaryItem[]> => {
  const grouped: Record<string, GlossaryItem[]> = items.reduce(
    (acc, item) => {
      const letter = item.letter;
      acc[letter] = [...(acc[letter] || []), item];
      return acc;
    },
    {} as Record<string, GlossaryItem[]>
  );
  return Object.keys(grouped)
    .sort()
    .reduce(
      (obj, key) => {
        obj[key] = grouped[key];
        return obj;
      },
      {} as Record<string, GlossaryItem[]>
    );
};

const Page: NextPage = () => {
  const groupedItems = groupAndSortByLetter(glossaryItems);
  return (
    <>
      {/* Header Section */}
      <section id="top">
        <div className="content">
          <h2>Glossary</h2>
          <p>
            Our design system glossary is your go-to reference for a shared
            vocabulary — a living document that grows with our blueprints and
            best practices. Here you’ll find clear definitions, practical
            examples, and curated links to deep-dive resources so you can
            quickly get up to speed, collaborate more effectively, and apply
            these concepts with confidence. Check back often as we expand and
            refine this guide alongside our system’s evolution.
          </p>
        </div>
      </section>
      <section>
        <div className="content">
          <h3>Jump to:</h3>
          <ol className="glossary-letters">
            {Object.entries(groupedItems).map(([letter]) => (
              <li key={letter} className="glossary-letter">
                <Link href={`#glossary-letter-${letter}`}>{letter}</Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {/* Glossary Definition List Section */}
      <section className="content glossary">
        <ul className="glossary-list">
          {Object.entries(groupedItems).map(([letter, items]) => (
            <li key={letter} className="sub-list">
              <div className="glossary-letter-header">
                <h3 id={`glossary-letter-${letter}`} className="dateYear">
                  <span>{letter}</span>
                </h3>
                <Link href="#top" className="back-to-top">
                  Back to top
                  <Icon icon={byPrefixAndName['far']['arrow-up']} />
                </Link>
              </div>
              <dl>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <dt
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em',
                        fontWeight: 600,
                      }}
                      className="glossary-item"
                    >
                      <h4>
                        {item.icon && (
                          <span style={{ display: 'inline-block' }}>
                            <Icon icon={item.icon} width={44} height={44} />
                          </span>
                        )}
                        {item.name}
                      </h4>
                    </dt>
                    <dd
                      className="content glossary-item"
                      style={{ marginBottom: '1em', marginLeft: '1.5em' }}
                    >
                      {item.description}
                      {item.resources && item.resources.length > 0 && (
                        <div
                          className="glossary-resources"
                          style={{ marginTop: '0.75em' }}
                        >
                          <strong>Resources:</strong>
                          <ul>
                            {item.resources.map((res, idx) => (
                              <li
                                key={res.href + idx}
                                style={{ marginBottom: '0.5em' }}
                              >
                                <Link
                                  href={res.href}
                                  target={res.external ? '_blank' : undefined}
                                  rel={
                                    res.external
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
                                >
                                  {res.label}
                                  {res.external && (
                                    <span
                                      style={{ marginLeft: 4 }}
                                      title="External link"
                                    >
                                      <Icon
                                        icon={
                                          byPrefixAndName['far'][
                                            'arrow-up-right-from-square'
                                          ]
                                        }
                                      />
                                    </span>
                                  )}
                                </Link>
                                <p className="glossary-resource-description">
                                  {res.description}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Page;
