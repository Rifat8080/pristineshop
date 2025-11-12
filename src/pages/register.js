import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layouts/AuthLayout';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Register failed');
  // After register, send user to root which is wrapped by AppLayout
  router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Name</label>
          <input className="w-full p-2 border rounded mb-4" value={name} onChange={(e)=>setName(e.target.value)} />

          <label className="block mb-2">Email</label>
          <input className="w-full p-2 border rounded mb-4" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />

          <label className="block mb-2">Password</label>
          <input className="w-full p-2 border rounded mb-4" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />

          <button className="w-full p-2 bg-indigo-600 text-white rounded" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          Already have an account? <Link href="/login" className="text-indigo-600">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

  Register.Layout = AuthLayout;
