'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation';
 
export default function NotFound(params: { slug: string } ) {
  const path = usePathname()
  const slug = path.charAt(0) === '/' ? path.slice(1) : path
  return (
    <div>
      <h2>Whoops, there isn&lsquo;t a page here...</h2>
      <p>Either check that the url <pre>{slug}</pre> is correct, or try going back to the home page.</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}