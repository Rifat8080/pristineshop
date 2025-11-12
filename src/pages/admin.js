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
        if (u && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN') {
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
    <div className="min-h-screen bg-red-50">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div>
            <span className="text-green-700 mr-4">{user.name || user.email}</span>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                router.push('/login');
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <CreateUserForm userRole={user.role} onSuccess={() => window.location.reload()} />
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <p className="text-green-700">Your Role: <span className="font-bold">{user.role}</span></p>
            <p className="text-green-700 text-sm mt-2">
              {user.role === 'SUPER_ADMIN'
                ? '✓ Can create users of all roles and promote other admins'
                : '✓ Can create USER and ADMIN accounts'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <UserList userRole={user.role} />
        </div>
      </div>
    </div>
  );
}

function CreateUserForm({ userRole, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMsg({ type: 'success', text: `Created ${data.email} (${data.role})` });
      setEmail('');
      setPassword('');
      setName('');
      setRole('USER');
      if (onSuccess) setTimeout(onSuccess, 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {msg && (
        <div className={msg.type === 'error' ? 'bg-red-100 text-red-700 p-3 rounded' : 'bg-green-100 text-green-700 p-3 rounded'}>
          {msg.text}
        </div>
      )}
      <input
        className="w-full p-2 border rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
      />
      <select className="w-full p-2 border rounded" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
        {userRole === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
      </select>
      <button className="w-full p-2 bg-indigo-600 text-white rounded font-medium" disabled={loading} type="submit">
        {loading ? 'Creating…' : 'Create user'}
      </button>
    </form>
  );
}

function UserList({ userRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/list-users?page=${page}&limit=${limit}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name || '—'}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    u.role === 'SUPER_ADMIN' ? 'bg-purple-200 text-purple-800' :
                    u.role === 'ADMIN' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-2 text-xs text-green-700">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <PromoteButton userId={u.id} userRole={u.role} adminRole={userRole} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-green-700">
          Page {page} of {Math.ceil(total / limit)} ({total} total)
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoteButton({ userId, userRole, adminRole }) {
  const [loading, setLoading] = useState(false);

  async function promote(newRole) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const d = await res.json();
        alert('Error: ' + (d.error || 'Failed to promote'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (userRole === 'USER') return null;

  const availableRoles = ['USER', 'ADMIN'];
  if (adminRole === 'SUPER_ADMIN') availableRoles.push('SUPER_ADMIN');

  return (
    <select
      className="text-xs p-1 border rounded"
      disabled={loading}
      onChange={(e) => promote(e.target.value)}
      defaultValue=""
    >
      <option value="">Change role…</option>
      {availableRoles.map((r) => (
        <option key={r} value={r}>
          → {r}
        </option>
      ))}
    </select>
  );
}
