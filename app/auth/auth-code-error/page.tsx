import Link from 'next/link';
import { login } from '@/app/ha/actions';
import Button from '@/ui/components/Button';
import { getSafeRedirectPath } from '@/utils/supabase/redirect';

export const metadata = {
  title: 'Sign-in help',
  robots: { index: false, follow: false },
};

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = getSafeRedirectPath(
    typeof params.next === 'string' ? params.next : null
  );

  return (
    <section className="content" aria-labelledby="sign-in-error-title">
      <h1 id="sign-in-error-title">We couldn&apos;t sign you in</h1>
      <p>
        Your sign-in link may have expired or already been used, or sign-in was
        interrupted. Your content has not been changed.
      </p>
      <p>
        Try signing in again. If you arrived from an email, use the newest link
        in your inbox.
      </p>
      <form action={login}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit">Try Google sign-in again</Button>
      </form>
      <p>
        <Link href="/">Return to the portfolio</Link>
      </p>
    </section>
  );
}
