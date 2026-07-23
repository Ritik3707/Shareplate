export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent mb-6">
            SharePlate
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Reducing Food Waste. Feeding Lives.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/register" className="btn-primary">Get Started</a>
            <a href="/login" className="btn-secondary">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}
