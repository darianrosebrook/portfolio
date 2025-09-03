import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import styles from './Tabs.module.scss';
import {
  TabsProps,
  TabsTheme,
  TabItem,
  TabsWrapperProps,
  TabListProps,
  TabProps,
  TabPanelProps,
  DEFAULT_TABS_TOKENS,
} from './Tabs.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Tabs.tokens.json';

function useTabsTokens(theme?: TabsTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`tabs-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_TABS_TOKENS).forEach(([k, v]) => {
          fb[`tabs-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'tabs');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

const TabsWrapper: React.FC<TabsWrapperProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  style,
}) => {
  const classes = [
    styles.tabsWrapper,
    orientation === 'vertical' ? styles['tabsWrapper--vertical'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};

const TabList: React.FC<TabListProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'medium',
  orientation = 'horizontal',
  role = 'tablist',
}) => {
  const classes = [
    styles.tabList,
    styles[`tabList--${variant}`] || '',
    styles[`tabList--${size}`] || '',
    orientation === 'vertical' ? styles['tabList--vertical'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role={role}>
      {children}
    </div>
  );
};

const Tab: React.FC<TabProps> = ({
  id,
  label,
  badge,
  active = false,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'medium',
  onClick,
  onKeyDown,
}) => {
  const classes = [
    styles.tab,
    styles[`tab--${variant}`] || '',
    styles[`tab--${size}`] || '',
    active ? styles['tab--active'] : '',
    disabled ? styles['tab--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event);
    }
    onKeyDown?.(event);
  };

  return (
    <button
      className={classes}
      role="tab"
      tabIndex={active ? 0 : -1}
      aria-selected={active}
      aria-controls={`${id}-panel`}
      id={`${id}-tab`}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {label}
      {badge && <span className={styles.tabBadge}>{badge}</span>}
    </button>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({
  id,
  tabId,
  children,
  active = false,
  className = '',
}) => {
  const classes = [styles.tabPanel, className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${tabId}-tab`}
      hidden={!active}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  defaultActiveTab,
  variant = 'default',
  size = 'medium',
  orientation = 'horizontal',
  disabled = false,
  theme,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  tabPanelClassName = '',
  onChange,
  onTabClick,
}) => {
  const { cssProperties } = useTabsTokens(theme);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Handle controlled vs uncontrolled state
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || items[0]?.id || ''
  );
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

  const safeVariant = safeTokenValue(variant, 'default', (v) =>
    ['default', 'pills', 'underline', 'bordered'].includes(v as string)
  ) as string;
  const safeSize = safeTokenValue(size, 'medium', (v) =>
    ['small', 'medium', 'large'].includes(v as string)
  ) as string;
  const safeOrientation = safeTokenValue(orientation, 'horizontal', (v) =>
    ['horizontal', 'vertical'].includes(v as string)
  ) as string;

  const handleTabClick = useCallback(
    (tab: TabItem, event: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled || tab.disabled) return;

      if (activeTab === undefined) {
        setInternalActiveTab(tab.id);
      }
      onChange?.(tab.id);
      onTabClick?.(tab, event);
    },
    [activeTab, disabled, onChange, onTabClick]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const enabledTabs = items.filter((tab) => !tab.disabled);
      const currentEnabledIndex = enabledTabs.findIndex(
        (tab) => tab.id === currentActiveTab
      );

      let nextIndex = currentEnabledIndex;

      if (safeOrientation === 'horizontal') {
        if (event.key === 'ArrowLeft') {
          nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        } else if (event.key === 'ArrowRight') {
          nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        }
      } else {
        if (event.key === 'ArrowUp') {
          nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        } else if (event.key === 'ArrowDown') {
          nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        }
      }

      if (nextIndex !== currentEnabledIndex) {
        event.preventDefault();
        const nextTab = enabledTabs[nextIndex];
        handleTabClick(nextTab, event);

        // Focus the next tab
        setTimeout(() => {
          const nextTabElement = tabListRef.current?.querySelector(
            `#${nextTab.id}-tab`
          ) as HTMLButtonElement;
          nextTabElement?.focus();
        }, 0);
      }
    },
    [items, currentActiveTab, safeOrientation, handleTabClick]
  );

  const activeTabItem = items.find((tab) => tab.id === currentActiveTab);

  return (
    <TabsWrapper
      className={className}
      orientation={safeOrientation}
      style={cssProperties}
    >
      <TabList
        ref={tabListRef}
        className={tabListClassName}
        variant={safeVariant}
        size={safeSize}
        orientation={safeOrientation}
      >
        {items.map((tab, index) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            badge={tab.badge}
            active={tab.id === currentActiveTab}
            disabled={disabled || tab.disabled}
            className={tabClassName}
            variant={safeVariant}
            size={safeSize}
            onClick={(event) => handleTabClick(tab, event)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </TabList>

      {activeTabItem && (
        <TabPanel
          id={currentActiveTab}
          tabId={currentActiveTab}
          active={true}
          className={`${styles[`tabPanel--${safeSize}`] || ''} ${tabPanelClassName}`}
        >
          {activeTabItem.content}
        </TabPanel>
      )}
    </TabsWrapper>
  );
};

// Sub-component exports
Tabs.Wrapper = TabsWrapper;
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
export type { TabsProps, TabsTheme, TabItem } from './Tabs.types';
