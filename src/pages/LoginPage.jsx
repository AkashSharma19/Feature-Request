import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button, Card } from '../components/ui';
import { Zap, ShieldCheck, Layout, Users, Handshake } from 'lucide-react';

export default function LoginPage() {
  const { user, userOrg, loginWithGoogle, isAuthLoading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthLoading && user) {
      const from = location.state?.from;
      
      if (from) {
        navigate(from, { replace: true });
      } else if (userOrg) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, userOrg, isAuthLoading, navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center shadow-xl mb-6 animate-fade-in">
            <Handshake size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hand Shake</h1>
          <p className="text-gray-500 mt-3 font-medium">The all-in-one feature request & roadmap platform.</p>
        </div>

        <Card className="p-8 shadow-2xl border-gray-100 bg-white">
          <div className="space-y-6">
            <div className="text-left space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Layout size={16} />
                </div>
                <span>Create multiple custom feedback boards</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span>Sync statuses directly with ClickUp</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={16} />
                </div>
                <span>Collect insights from your users instantly</span>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full h-12 text-base font-bold shadow-gray-200 shadow-lg"
              onClick={loginWithGoogle}
              disabled={isAuthLoading}
            >
              <svg className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              Secure Login via Google Authentication
            </p>
          </div>
        </Card>

        <p className="text-xs text-gray-400">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-gray-900 font-bold hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gray-900 font-bold hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
