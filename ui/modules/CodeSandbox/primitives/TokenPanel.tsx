import * as React from 'react';

export type TokenPanelProps = {
  /**
   * Optional tokens to display. If not provided, will extract from preview iframe
   * or current document's computed styles
   */
  tokens?: Record<string, string>;
  /** Target window to extract tokens from (e.g., preview iframe) */
  targetWindow?: Window | null;
  /** Show only tokens matching these prefixes */
  filter?: string[];
  /** Maximum number of tokens to display */
  limit?: number;
};

type TokenInfo = {
  name: string;
  value: string;
  resolvedValue?: string;
  category: string;
  description?: string;
};

export function TokenPanel({
  tokens: providedTokens,
  targetWindow,
  filter = [],
  limit = 50,
}: TokenPanelProps) {
  const [tokens, setTokens] = React.useState<TokenInfo[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const extractTokensFromElement = React.useCallback(
    (win: Window): TokenInfo[] => {
      const computedStyle = win.getComputedStyle(win.document.documentElement);
      const extractedTokens: TokenInfo[] = [];

      // Get all CSS custom properties from the computed style
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        if (prop.startsWith('--')) {
          const value = computedStyle.getPropertyValue(prop).trim();
          if (value) {
            const category = categorizeToken(prop);
            extractedTokens.push({
              name: prop,
              value,
              resolvedValue: resolveTokenValue(value, computedStyle),
              category,
              description: generateTokenDescription(prop, value),
            });
          }
        }
      }

      return extractedTokens.sort((a, b) => a.name.localeCompare(b.name));
    },
    []
  );

  const categorizeToken = (name: string): string => {
    if (name.includes('color')) return 'Color';
    if (name.includes('spacing') || name.includes('size')) return 'Spacing';
    if (name.includes('typography') || name.includes('font'))
      return 'Typography';
    if (name.includes('elevation') || name.includes('shadow'))
      return 'Elevation';
    if (name.includes('radius') || name.includes('border')) return 'Shape';
    if (name.includes('motion') || name.includes('duration')) return 'Motion';
    if (name.includes('opacity')) return 'Opacity';
    return 'Other';
  };

  const resolveTokenValue = (
    value: string,
    computedStyle: CSSStyleDeclaration
  ): string => {
    // If the value references another CSS custom property, try to resolve it
    const varMatch = value.match(/var\(([^,)]+)/);
    if (varMatch) {
      const referencedVar = varMatch[1].trim();
      const resolvedValue = computedStyle
        .getPropertyValue(referencedVar)
        .trim();
      return resolvedValue || value;
    }
    return value;
  };

  const generateTokenDescription = (name: string, value: string): string => {
    if (name.includes('semantic-color-foreground-primary'))
      return 'Primary text color';
    if (name.includes('semantic-color-background-primary'))
      return 'Primary background color';
    if (name.includes('core-spacing-size')) return 'Spacing scale value';
    if (name.includes('core-typography-ramp')) return 'Typography size scale';
    if (name.includes('semantic-color-border')) return 'Border color';
    if (name.includes('core-shape-radius')) return 'Border radius value';
    return `Design token: ${value}`;
  };

  React.useEffect(() => {
    if (providedTokens) {
      const tokenList: TokenInfo[] = Object.entries(providedTokens).map(
        ([name, value]) => ({
          name: name.startsWith('--') ? name : `--${name}`,
          value,
          category: categorizeToken(name),
          description: generateTokenDescription(name, value),
        })
      );
      setTokens(tokenList);
      return;
    }

    // Extract tokens from target window or current window
    const win = targetWindow || window;
    try {
      const extractedTokens = extractTokensFromElement(win);

      // Apply filters if provided
      const filteredTokens =
        filter.length > 0
          ? extractedTokens.filter((token) =>
              filter.some((f) => token.name.includes(f))
            )
          : extractedTokens;

      setTokens(filteredTokens.slice(0, limit));
    } catch (error) {
      console.warn('Failed to extract design tokens:', error);
      setTokens([]);
    }
  }, [providedTokens, targetWindow, filter, limit, extractTokensFromElement]);

  const copyToClipboard = React.useCallback(
    async (tokenName: string, value: string) => {
      try {
        await navigator.clipboard.writeText(`var(${tokenName})`);
        setCopiedToken(tokenName);
        setTimeout(() => setCopiedToken(null), 2000);
      } catch (error) {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = `var(${tokenName})`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedToken(tokenName);
        setTimeout(() => setCopiedToken(null), 2000);
      }
    },
    []
  );

  const filteredTokens = React.useMemo(() => {
    if (!searchQuery) return tokens;
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  const groupedTokens = React.useMemo(() => {
    const groups: Record<string, TokenInfo[]> = {};
    filteredTokens.forEach((token) => {
      if (!groups[token.category]) {
        groups[token.category] = [];
      }
      groups[token.category].push(token);
    });
    return groups;
  }, [filteredTokens]);

  const visibleTokens = isExpanded
    ? filteredTokens
    : filteredTokens.slice(0, 10);

  return (
    <div
      style={{
        border: '1px solid var(--semantic-color-border-subtle, #ccc)',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: 'var(--semantic-color-background-primary, #fff)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <strong
          style={{ color: 'var(--semantic-color-foreground-primary, #000)' }}
        >
          Design Tokens
        </strong>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--semantic-color-border-subtle, #ccc)',
              borderRadius: '4px',
              fontSize: '12px',
              width: '120px',
            }}
          />
          {filteredTokens.length > 10 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--semantic-color-border-subtle, #ccc)',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor:
                  'var(--semantic-color-background-secondary, #f5f5f5)',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? 'Show Less' : `Show All (${filteredTokens.length})`}
            </button>
          )}
        </div>
      </div>

      {visibleTokens.length === 0 ? (
        <div
          style={{
            color: 'var(--semantic-color-foreground-secondary, #666)',
            fontSize: '12px',
          }}
        >
          No design tokens found
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(groupedTokens).map(([category, categoryTokens]) => (
            <div key={category}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--semantic-color-foreground-secondary, #666)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {category}
              </div>
              {categoryTokens
                .slice(0, isExpanded ? undefined : 5)
                .map((token) => (
                  <div
                    key={token.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      padding: '6px 8px',
                      backgroundColor:
                        'var(--semantic-color-background-secondary, #f9f9f9)',
                      borderRadius: '4px',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => copyToClipboard(token.name, token.value)}
                    title={`Click to copy: var(${token.name})`}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily:
                            'var(--semantic-typography-semanticFamily-mono, monospace)',
                          fontSize: '11px',
                          color:
                            'var(--semantic-color-foreground-primary, #000)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {token.name}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color:
                            'var(--semantic-color-foreground-secondary, #666)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {token.resolvedValue || token.value}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {/* Visual preview for colors */}
                      {token.category === 'Color' && (
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '2px',
                            backgroundColor: token.resolvedValue || token.value,
                            border:
                              '1px solid var(--semantic-color-border-subtle, #ccc)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {/* Copy indicator */}
                      <div
                        style={{
                          fontSize: '10px',
                          color:
                            copiedToken === token.name
                              ? 'var(--semantic-color-status-success, #10b981)'
                              : 'var(--semantic-color-foreground-tertiary, #999)',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {copiedToken === token.name ? '✓' : '📋'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '8px',
          fontSize: '10px',
          color: 'var(--semantic-color-foreground-tertiary, #999)',
        }}
      >
        {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} •
        Click to copy CSS var()
      </div>
    </div>
  );
}
