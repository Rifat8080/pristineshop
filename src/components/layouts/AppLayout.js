import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AppLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) return null;
        const d = await r.json();
        return d.user;
      })
      .then((u) => {
        if (!mounted) return;
        if (!u) {
          router.push('/login');
          return;
        }
        setUser(u);
      })
      .catch(() => router.push('/login'))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [router]);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  }

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">PristineShop</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-700">{user?.name || user?.email}</span>
            <button onClick={signOut} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 flex gap-6">
        <aside className="w-64 hidden md:block">
          <div className="bg-white rounded shadow p-4 sticky top-6">
            <nav className="space-y-2">
              <Link href="/profile" className="block px-3 py-2 rounded hover:bg-gray-100">Profile</Link>
              <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-100">Home</Link>
              <Link href="/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Admin</Link>
            </nav>
          </div>
        </aside>

        <main className="flex-1">{children}</main>
      </div>

      <footer className="max-w-6xl mx-auto p-4 text-sm text-center text-gray-500">© PristineShop</footer>
    </div>
  );
}
