'use client';

import { Select } from '@/ui/Select';

export default function ComponentsPage() {
  const options = [
    { title: 'Option 1', group: 'title', id: 'opt1' },
    { title: 'Option 2', group: 'title', id: 'opt2' },
    { title: 'Option 3', group: 'title', id: 'opt3' },
  ];
  return (
    <>
      <section className="content">
        <h2>Components</h2>
        <p>
          This is a visual collection of all the components in our design
          system, as a test for our design system congruency and consistency.
        </p>
      </section>
      <section className="content">
        <h2>Component Library</h2>
        {/* 3x3 grid of components */}
        <div className="grid">
          {/* card */}
          <div>
            <Select
              options={options}
              onChange={() => null}
              multiselect={false}
            />
          </div>
        </div>
      </section>
    </>
  );
}
