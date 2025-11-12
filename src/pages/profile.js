import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw r;
        return r.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <div className="mb-4">Name: {user.name || '—'}</div>
        <div className="mb-4">Email: {user.email}</div>
        <div className="mb-4">Role: {user.role}</div>

        <div className="flex gap-2">
          <button
            className="p-2 bg-red-600 text-white rounded"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
