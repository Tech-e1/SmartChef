import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Hero from '../pages/Hero';
import Loading from './Loading'
import ErrorPage from '../pages/auth/error';
import { useSession } from '@/contexts/SessionContext';

/* Note all components will be wrapped in this component which in turn is rendered by _app.tsx */
const Layout = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const router = useRouter();
  const { error: signinError } = router.query;

  if (signinError) {
    return <ErrorPage />
  }

  if (router.pathname === '/_error') {
    return <ErrorPage message="Page not found" />;
  }

  return (
    <div>
      <Header user={session?.user} />
      <main className="min-h-screen bg-brand-50">{children}</main>
    </div>
  );
};

export default Layout;