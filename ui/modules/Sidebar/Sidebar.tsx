import Link from 'next/link';
import './Sidebar.css';

export interface SidebarSection {
  title: string;
  items: { label: string; href: string }[];
}

export interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  return (
    <aside
      data-ds-component="Sidebar"
      className="root"
      aria-label="Section navigation"
    >
      {sections.map((section) => (
        <div key={section.title} className="group">
          <h4>{section.title}</h4>
          <nav className="nav">
            {section.items.map((item) => (
              <Link key={item.href} className="link" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
