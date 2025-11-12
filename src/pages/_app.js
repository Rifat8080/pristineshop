import "@/styles/globals.css";
import 'flowbite/dist/flowbite.css';
import AppLayout from '@/components/layouts/AppLayout';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const Layout = Component.Layout || AppLayout;

  // Flowbite depends on DOM APIs; load it client-side only to avoid SSR issues
  useEffect(() => {
    import('flowbite');
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
