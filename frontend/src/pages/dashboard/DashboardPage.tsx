import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Welcome</h3>
          <p className="text-slate-600 dark:text-slate-400">{user?.firstName} {user?.lastName}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Role</h3>
          <p className="text-slate-600 dark:text-slate-400">{user?.role}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/donations/create" className="block text-emerald-600 hover:underline">Create Donation</a>
            <a href="/donations" className="block text-emerald-600 hover:underline">View Donations</a>
          </div>
        </div>
      </div>
    </div>
  );
}
