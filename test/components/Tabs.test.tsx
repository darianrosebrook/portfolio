import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Tabs from '@/ui/components/Tabs';
import { TabsProvider, TabList, Tab, TabPanel } from '@/ui/components/Tabs';

expect.extend(toHaveNoViolations);

describe('Tabs Composer', () => {
  const setup = (props: any = {}) =>
    render(
      <main>
        <TabsProvider defaultValue="one" {...props}>
          <Tabs>
            <TabList>
              <Tab value="one">One</Tab>
              <Tab value="two">Two</Tab>
              <Tab value="three" disabled>
                Three
              </Tab>
            </TabList>
            <TabPanel value="one">Panel One</TabPanel>
            <TabPanel value="two">Panel Two</TabPanel>
            <TabPanel value="three">Panel Three</TabPanel>
          </Tabs>
        </TabsProvider>
      </main>
    );

  it('renders roles and selected state', () => {
    setup();
    const list = screen.getByRole('tablist');
    expect(list).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('switches panels on activation', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText('Panel One')).toBeVisible();
    await user.click(screen.getAllByRole('tab')[1]);
    expect(screen.getByText('Panel Two')).toBeVisible();
  });

  it('supports keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    setup();
    const [t0, t1] = screen.getAllByRole('tab');
    t0.focus();
    await user.keyboard('{ArrowRight}');
    expect(t1).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Panel Two')).toBeVisible();
  });

  it('skips disabled tabs during navigation', async () => {
    const user = userEvent.setup();
    setup();
    const tabs = screen.getAllByRole('tab');
    tabs[1].focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    // from two -> three(disabled) -> wrap to one
    expect(tabs[0]).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    setup();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
