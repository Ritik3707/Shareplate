import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../store/slices/authSlice';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'DONOR',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(register(form) as any);
      navigate('/verify-email');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input">
            <option value="DONOR">Food Donor</option>
            <option value="NGO">NGO</option>
            <option value="VOLUNTEER">Volunteer</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Create Account</button>
      </form>
      <p className="text-center mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-emerald-600">Sign in</Link>
      </p>
    </div>
  );
}
