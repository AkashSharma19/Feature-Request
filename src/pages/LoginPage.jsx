import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button, Card } from '../components/ui';
import { Zap, ShieldCheck, Layout, Users } from 'lucide-react';

export default function LoginPage() {
  const { user, userOrg, loginWithGoogle, isAuthLoading } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (userOrg) {
        navigate('/admin');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, userOrg, isAuthLoading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-bounce-subtle">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coach Feedback</h1>
          <p className="text-gray-500 mt-2">The all-in-one feature request & roadmap platform.</p>
        </div>

        <Card className="p-8 shadow-xl border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="text-left space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Layout size={16} />
                </div>
                <span>Create multiple custom feedback boards</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span>Sync statuses directly with ClickUp</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={16} />
                </div>
                <span>Collect insights from your users instantly</span>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full h-12 text-base font-bold shadow-teal-200 shadow-lg"
              onClick={loginWithGoogle}
              disabled={isAuthLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" alt="Google" />
              Sign in with Google
            </Button>

            <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              Secure Login via Google Authentication
            </p>
          </div>
        </Card>

        <p className="text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
