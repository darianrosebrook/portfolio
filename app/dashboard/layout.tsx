import { redirect } from "next/navigation";
import styles from "./page.module.scss";
import { headers } from "next/headers";

import { createClient } from "@/utils/supabase/server";

import { byPrefixAndName } from "@awesome.me/kit-0ba7f5fefb/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default async function PrivateRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const dashboard = byPrefixAndName["far"]["grid-2"];
  const articles = byPrefixAndName["far"]["newspaper"];
  const caseStudies = byPrefixAndName["far"]["flask"];
  const account = byPrefixAndName["far"]["id-card"];
  const settings = byPrefixAndName["far"]["sliders-h"];
  const tabs = [
    { name: "Dashboard", url: "/dashboard", icon: dashboard, active: false },
    { name: "Articles", url: "/dashboard/articles", icon: articles, active: false },
    { name: "Case Studies", url: "/dashboard/case-studies", icon: caseStudies, active: false },
    { name: "Account", url: "/dashboard/account", icon: account, active: false },
    { name: "Settings", url: "/dashboard/settings", icon: settings, active: false },
  ];
  const url = headers().get("x-current-path");  
  const activeTab = tabs.find((tab) => tab.url === url);
  if (activeTab) {
    activeTab.active = true;
  }
  return (

    <section className={styles.dashboard__container}>
      <aside className={styles.navigation}  >
        <ul className={styles.navigation__tabs}>
          {tabs.map((tab) => (
            <li key={tab.name} className={`${styles.tab} ${tab.active ? styles.active : ""}`}>
              <Link href={tab.url} passHref>
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {children}
    </section>
  )
}
