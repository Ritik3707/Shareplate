export default function ForgotPasswordPage() {
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="input" required />
        </div>
        <button type="submit" className="btn-primary w-full">Send Reset Link</button>
      </form>
    </div>
  );
}
