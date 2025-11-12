import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          router.push('/login');
          return null;
        }
        const d = await r.json();
        return d.user;
      })
      .then((u) => {
        if (u && u.role !== 'ADMIN') {
          router.push('/profile');
          return;
        }
        setUser(u);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <p className="mb-4">Welcome, {user.name || user.email}. You are an admin.</p>
        <div className="mb-4">(Add admin-only tools here)</div>
      </div>
    </div>
  );
}
