import { render } from '@testing-library/react';
import CaseStudyContent, {
  wrapTables,
} from '@/app/work/_components/CaseStudyContent';

const TABLE =
  '<table style="min-width: 75px;"><colgroup><col></colgroup><tbody>' +
  '<tr><th colspan="1" rowspan="1"><p>Distinction</p></th><th colspan="1" rowspan="1"><p>What forced it</p></th></tr>' +
  '<tr><td colspan="1" rowspan="1"><p>Measurement apparatus vs. signal</p></td><td colspan="1" rowspan="1"><p>Structure</p></td></tr>' +
  '</tbody></table>';

function parse(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
}

describe('wrapTables', () => {
  it('puts each table inside a focusable region labelled by its header row', () => {
    const host = parse(wrapTables(`<p>Before</p>${TABLE}<p>After</p>`));
    const region = host.querySelector('div.table-scroll');

    expect(region).not.toBeNull();
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.getAttribute('aria-label')).toBe(
      'Table: Distinction, What forced it'
    );
    // the table moved into the region intact, and the prose around it stayed outside
    expect(region?.children).toHaveLength(1);
    expect(region?.firstElementChild?.tagName).toBe('TABLE');
    expect(region?.querySelectorAll('tr')).toHaveLength(2);
    expect([...host.children].map((el) => el.tagName)).toEqual([
      'P',
      'DIV',
      'P',
    ]);
  });

  it('labels each of several tables from its own header row', () => {
    const second = TABLE.replace('Distinction', 'Hypothesis').replace(
      'What forced it',
      'Program'
    );
    const labels = [
      ...parse(wrapTables(TABLE + second)).querySelectorAll('.table-scroll'),
    ].map((el) => el.getAttribute('aria-label'));

    expect(labels).toEqual([
      'Table: Distinction, What forced it',
      'Table: Hypothesis, Program',
    ]);
  });

  it('falls back to a plain label when the first row has no header cells', () => {
    const headerless =
      '<table><tbody><tr><td><p>a</p></td><td><p>b</p></td></tr></tbody></table>';
    const region = parse(wrapTables(headerless)).querySelector('.table-scroll');

    expect(region?.getAttribute('aria-label')).toBe('Table');
  });

  it('escapes header text so a quote in a cell cannot add attributes to the region', () => {
    // Cell text reaches this step with double quotes unescaped: the HTML serializer
    // only escapes &, < and > in text, and the CMS sanitizer is pattern-based.
    const hostile =
      '<table><tbody><tr><th><p>x" onfocus="alert(1)" data-pwned="1</p></th></tr></tbody></table>';
    const host = parse(wrapTables(hostile));
    const region = host.querySelector('.table-scroll');

    expect(region?.getAttributeNames().sort()).toEqual([
      'aria-label',
      'class',
      'role',
      'tabindex',
    ]);
    expect(region?.getAttribute('aria-label')).toBe(
      'Table: x" onfocus="alert(1)" data-pwned="1'
    );
    expect(host.querySelector('[onfocus], [data-pwned]')).toBeNull();
  });

  it('leaves html without tables unchanged', () => {
    const html = '<h2>Heading</h2><p>Text with a <code>table</code> word.</p>';
    expect(wrapTables(html)).toBe(html);
  });
});

describe('CaseStudyContent', () => {
  it('renders sanitized tables inside the scroll region', () => {
    const { container } = render(
      <CaseStudyContent html={`<p>Intro</p>${TABLE}`} />
    );

    const region = container.querySelector(
      '.case-study-content > .table-scroll'
    );
    expect(region?.getAttribute('aria-label')).toBe(
      'Table: Distinction, What forced it'
    );
    expect(region?.querySelector('table td')?.textContent).toBe(
      'Measurement apparatus vs. signal'
    );
  });

  it('still strips event handlers from content before wrapping tables', () => {
    const { container } = render(
      <CaseStudyContent
        html={
          '<table><tbody><tr><th onclick="alert(1)"><p>H</p></th></tr></tbody></table>'
        }
      />
    );

    expect(container.querySelector('[onclick]')).toBeNull();
    expect(
      container.querySelector('.table-scroll')?.getAttribute('aria-label')
    ).toBe('Table: H');
  });
});
