import "@/styles/globals.css";
import AppLayout from '@/components/layouts/AppLayout';

export default function App({ Component, pageProps }) {
  const Layout = Component.Layout || AppLayout;
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
