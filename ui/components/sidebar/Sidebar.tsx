import Link from 'next/link';
import styles from './Sidebar.module.scss';

export interface SidebarSection {
  title: string;
  items: { label: string; href: string }[];
}

export interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  return (
    <aside className={styles.root} aria-label="Section navigation">
      {sections.map((section) => (
        <div key={section.title} className={styles.group}>
          <h4>{section.title}</h4>
          <nav className={styles.nav}>
            {section.items.map((item) => (
              <Link key={item.href} className={styles.link} href={item.href}>
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
