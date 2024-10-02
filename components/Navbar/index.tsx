"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";
import styles from "./index.module.css";
import Logo from "./logo";
import Avatar from "../Avatar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Popover from "../Popover/Popover";


export default function Navbar({id = null}) {
  console.log( "id", id);
  
  const [profile, setProfile] = useState(null);
  const getProfile = async () => {
    const client = createClient();
    const response = await client.from("profiles").select("*").eq("id", id);
    setProfile(response.data[0]);
    console.log(profile);
  }
  let full_name = profile?.full_name || "Darian Rosebrook";
  let avatar_url = profile?.avatar_url || "/images/avatar.png";
  const pathname = usePathname();
  const paths = [
    ["/articles", "Articles"],
    ["/work", "Work"],
    ["/about", "About"],
  ];
  useEffect(() => {
    if (id && !profile) {
      getProfile();
    }
  });
  return (
    <header className={styles.navContainer}>
      <nav className={styles.nav}>
        <Link href="/" className="logoLink">
          <Logo />
          <h1 className="medium logo">{`Darian Rosebrook`}</h1>
        </Link>
        <ul>
          {paths.map(([route, name]) => (
            <li key={name}>
              <Link
                href={route}
                className={pathname === route ? styles.active : ""}
              >
                {name}
              </Link>
            </li>
          ))}
          {profile && (
            <li>
              <Popover>
                <Popover.Trigger>
                  <Avatar src={avatar_url} name={full_name} size="large" />
                </Popover.Trigger>
                <Popover.Content>
                  <LogoutButton />
                </Popover.Content>
              </Popover></li>
          )}
        </ul>
      </nav>
    </header>
  );
}
