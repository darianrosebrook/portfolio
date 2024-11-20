"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import styles from "./index.module.css";
import Logo from "./logo";
import Avatar from "../Avatar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Popover from "../Popover/Popover";
import Button from "../Button";
import { byPrefixAndName } from "@awesome.me/kit-0ba7f5fefb/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToggleSwitch from "../ToggleSwitch";

const faBars = byPrefixAndName["far"]["bars"];

type NavbarProps = {
  pages:  {name: string, path: string, admin: boolean}[] | null;
  id: string;
};
export default function Navbar({pages = [], id = null }: NavbarProps) {
  const [profile, setProfile] = useState(null);
  const [slider, setSlider] = useState(false); 

  const getProfile = async () => {
    const client = await createClient();
    const response = await client.from("profiles").select("*").eq("id", id);
    setProfile(response.data[0]);
    console.log(profile);
  }
  const full_name = profile?.full_name || "Darian Rosebrook";
  const avatar_url = profile?.avatar_url || "/images/avatar.png";
  const pathname = usePathname();  
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
        <ul className={styles.navLinks}>
          {pages.length > 0 && pages.map(page => (
            <li key={page.name}>
              <Link
                href={`/${page.path}`}
                className={pathname === page.path ? styles.active : ""}
              >
                {page.name}
              </Link>
            </li>
          ))}
          <li>
            <Popover>
              <Popover.Trigger>
                <Button variant="tertiary" size="small"><FontAwesomeIcon icon={faBars} /></Button>
              </Popover.Trigger>
              <Popover.Content>
                <ul className="menuList">
                  <li><ToggleSwitch checked={false} disabled={true} onChange={() => null}  > Reduce animations (coming soon) </ToggleSwitch></li>
                  <li><ToggleSwitch checked={slider} onChange={() => setSlider(!slider)} > But hey, check out this cool ToggleSwitch </ToggleSwitch></li>
                </ul>
              </Popover.Content>
            </Popover>
          </li>
          {profile && (
            <li>
              <Popover>
                <Popover.Trigger>
                  <Avatar src={avatar_url} name={full_name} size="large" />
                </Popover.Trigger>
                <Popover.Content>
                  <ul className="menuList">
                    <li >
                      <Link className="menuItem" href={`/profile/${id}`}>Profile</Link>
                    </li>
                    <li >
                      <Link className="menuItem" href="/dashboard">Dashboard</Link>
                    </li>
                    <li >
                      <Link className="menuItem" href="/settings">Settings</Link>
                    </li>
                  </ul>
                  <Button href="/signout" as="a">Logout</Button>
                </Popover.Content>
              </Popover></li>
          )}
        </ul>
      </nav>
    </header>
  );
}
