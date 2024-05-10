import Image from "next/image";
import styles from "./avatar.module.css";
 
type AvatarProps = {
    src?: string;
    name: string;
    size: string;
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
                <Image src={src} alt={name} width={16} height={16} />
            ) : (
                <span>{initials(name)}</span>
            )}
        </div>
    );
}