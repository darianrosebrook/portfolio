/**
 * Metadata for the /ha page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'HA | Human Access Only',
  description:
    "A playful test page for the emergency broadcast system. If you are a human, you can't see this.",
};

import LoginButton from '@/ui/modules/Navbar/loginButton';

export default function Page() {
  return (
    <section className="content">
      <h3>If you are a human, you can&apos;t see this</h3>
      <p>
        This is a test of the emergency broadcast system. If you are a human,
        you can&apos;t see this.
      </p>
      <LoginButton />
    </section>
  );
}
