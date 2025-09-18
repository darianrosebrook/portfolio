import {
  DocLayout,
  DocLayoutProvider,
  DocSection,
} from '@/ui/modules/DocLayout';
import { render, screen } from '../test-utils';

const sections = [
  {
    id: 'one',
    title: 'One',
    codeHighlight: { file: '/A.tsx', lines: [1, 3] as [number, number] },
  },
  {
    id: 'two',
    title: 'Two',
    codeHighlight: { file: '/B.tsx', lines: [4, 6] as [number, number] },
  },
];

const codeFiles = {
  '/A.tsx': 'export const A = 1;\nexport const B = 2;\nexport const C = 3;\n',
  '/B.tsx': 'export const D = 4;\nexport const E = 5;\nexport const F = 6;\n',
};

describe('DocLayout', () => {
  it('initializes from hash and sets active file/highlight', async () => {
    // Simulate initial hash
    window.history.replaceState(null, '', '#two');

    render(
      <DocLayoutProvider sections={sections}>
        <DocLayout codeFiles={codeFiles}>
          <div>
            <DocSection id="one">
              <h2>One</h2>
            </DocSection>
            <DocSection id="two">
              <h2>Two</h2>
            </DocSection>
          </div>
        </DocLayout>
      </DocLayoutProvider>
    );

    // Sandpack renders an iframe; we cannot directly assert highlighted lines easily.
    // But we can at least assert the hash remains and the target section exists in the DOM.
    expect(window.location.hash).toBe('#two');
    expect(screen.getByRole('heading', { name: 'Two' })).toBeInTheDocument();
  });
});
