import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button, Card, Input } from '../components/ui';
import { Building2, Rocket, ArrowRight, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
  const { user, createOrganization } = useStore();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setLoading(true);
    try {
      await createOrganization(orgName);
      navigate('/admin');
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Setup your Workspace</h1>
          <p className="text-gray-500 mt-2">Welcome {user.displayName}! Let's create a home for your feedback.</p>
        </div>

        <Card className="p-8 shadow-xl border-gray-100">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Company / Workspace Name</label>
              <Input 
                autoFocus
                placeholder="e.g. Acme Corp" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)}
                className="h-12 text-lg font-medium"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-gray-900 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">
                <CheckCircle size={16} />
                <span>Your workspace will be isolated and secure.</span>
              </div>
            </div>

            <Button 
              type="submit"
              variant="primary" 
              size="lg" 
              className="w-full h-12 text-base font-bold shadow-gray-200 shadow-lg"
              disabled={loading || !orgName.trim()}
            >
              {loading ? "Initializing..." : "Launch Workspace"}
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400">
          You can change your workspace name later in settings.
        </p>
      </div>
    </div>
  );
}
