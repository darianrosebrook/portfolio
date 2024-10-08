import Image from "next/image";
import styles from "./avatar.module.css";

type AvatarProps = {
    src?: string;
    name: string;
    size: "small" | "medium" | "large" | "extra-large";
};

function initials(name: string) {
    let parts = name.split(" ");
    if (parts.length > 2) {
        parts = parts.slice(0, 2);
    }
    return parts.map((part) => part[0]).join("");
}

export default function Avatar({ src, name, size }: AvatarProps) {
    return (
        <div className={`${styles.avatar} ${styles['avatar_' + size]}`}>
            {src ? (
                <img src={src} alt={name} />
            ) : (
                <span>{initials(name)}</span>
            )}
        </div>
    );
}