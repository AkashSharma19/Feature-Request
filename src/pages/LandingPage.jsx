import { Sparkles, ArrowRight, Zap, Target, Star, Kanban, Users, BarChart3, Bot, Globe, Shield, Zap as ZapIcon, CheckCircle2, Handshake } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Interactive Roadmap",
      description: "Visualize your product strategy with beautiful Kanban boards. Keep everyone aligned on what's next.",
      icon: <Kanban className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600",
      delay: "animation-delay-0"
    },
    {
      title: "User Voting",
      description: "Let your users vote on features. Identify high-impact ideas that drive real business value.",
      icon: <Users className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600",
      delay: "animation-delay-200"
    },
    {
      title: "AI Feedback Bot",
      description: "Our smart assistant handles common suggestions and helps users structure their feedback automatically.",
      icon: <Bot className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
      delay: "animation-delay-400"
    },
    {
      title: "Deep Analytics",
      description: "Track sentiment, request volume, and status distributions with real-time dashboards.",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-600",
      delay: "animation-delay-600"
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for side projects and early feedback.",
      features: ["1 Active Board", "100 Monthly Requests", "Community Support", "Basic Analytics"],
      cta: "Get Started",
      variant: "secondary"
    },
    {
      name: "Pro",
      price: "$49",
      description: "Everything you need to scale your product.",
      features: ["Unlimited Boards", "Unlimited Requests", "Priority Support", "Advanced Analytics", "ClickUp Integration"],
      cta: "Try Pro Free",
      variant: "primary",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Advanced security and dedicated support.",
      features: ["Custom Domain", "SSO & SAML", "Dedicated Manager", "SLA Guarantee", "White-labeling"],
      cta: "Contact Sales",
      variant: "secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-gray-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Hand Shake</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/onboarding')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold mb-8 animate-fade-in shadow-sm tracking-widest uppercase">
            <Sparkles size={12} className="text-gray-900" />
            <span>Modern Feedback Management</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 animate-slide-up max-w-4xl mx-auto leading-[1.1]">
            Build the features your users <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">actually want.</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-12 animate-slide-up animation-delay-200 leading-relaxed max-w-2xl mx-auto font-medium">
            Stop guessing. Hand Shake helps you collect, analyze, and prioritize user feedback with a stunning roadmap and automated workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
            <Button variant="primary" size="lg" className="h-14 px-8 text-base shadow-xl shadow-gray-900/10 group" onClick={() => navigate('/onboarding')}>
              Start for free
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="h-14 px-8 text-base" onClick={() => navigate('/login')}>
              Book a Demo
            </Button>
          </div>

          {/* Product Mockup Shadow / Reflection */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-slide-up animation-delay-600">
            <div className="absolute inset-0 bg-gray-900/5 rounded-3xl blur-2xl -rotate-1 translate-y-8" />
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden aspect-video group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-transparent opacity-50" />
              <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 bg-white rounded-lg h-6 border border-gray-100" />
              </div>
              {/* Abstract dashboard preview */}
              <div className="p-8 grid grid-cols-12 gap-6 h-full">
                <div className="col-span-3 space-y-4">
                  <div className="h-8 bg-gray-900 rounded-xl w-3/4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-100 rounded-lg w-full" />)}
                  </div>
                </div>
                <div className="col-span-9 grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100/50">
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                      <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm" />
                      <div className="h-24 bg-white rounded-xl border border-gray-100 shadow-sm" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/5 transition-colors duration-500 cursor-pointer flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold text-gray-900 flex items-center gap-2">
                  Launch Dashboard <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-gray-50 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">Trusted by modern product teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale">
            {['LINEAR', 'VERCEL', 'STRIPE', 'NOTION', 'RAYCAST'].map(name => (
              <span key={name} className="font-extrabold text-xl tracking-tighter text-gray-900">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Everything you need to ship faster.</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Hand Shake provides a suite of tools designed to bridge the gap between user needs and your product strategy.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className={cn(
                "p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300 group animate-slide-up",
                feature.delay
              )}>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Showcase */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold mb-6">
              <ZapIcon size={12} className="text-yellow-400 fill-yellow-400" />
              <span>SUPERCHARGED WORKFLOWS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8 leading-tight">
              Integrated with your <br />
              <span className="text-gray-400">entire tech stack.</span>
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-1">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-white">ClickUp Synchronization</h4>
                  <p className="text-sm text-gray-400">Automatically sync feature statuses with your internal ClickUp tasks. No manual updates required.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-1">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-white">Slack Notifications</h4>
                  <p className="text-sm text-gray-400">Get notified instantly when new high-priority feedback arrives or when a request gets upvoted.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-1">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-white">Enterprise SSO</h4>
                  <p className="text-sm text-gray-400">Secure your portal with Google Workspace, Okta, or any SAML provider.</p>
                </div>
              </div>
            </div>
            <Button variant="primary" className="mt-10 bg-white text-gray-900 hover:bg-gray-100 border-none px-8" onClick={() => navigate('/onboarding')}>
              Start Integration
            </Button>
          </div>
          <div className="relative">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10" />
                  <div className="w-24 h-8 rounded-lg bg-white/5" />
                </div>
                <div className="w-20 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center border border-blue-500/30 uppercase tracking-wider">Active</div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                      <div className="h-2 bg-white/5 rounded w-3/4" />
                    </div>
                    <div className="w-12 h-6 rounded-full bg-green-500/20 border border-green-500/30" />
                  </div>
                ))}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Simple, transparent pricing.</h2>
            <p className="text-gray-500">Pick a plan that grows with your product.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, i) => (
              <div key={i} className={cn(
                "p-8 rounded-[2rem] border relative transition-all duration-300",
                plan.popular 
                  ? "border-gray-900 shadow-2xl shadow-gray-900/10 bg-white scale-105 z-10" 
                  : "border-gray-100 bg-white hover:border-gray-300"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-500 text-sm">/mo</span>}
                </div>
                <p className="text-sm text-gray-500 mb-8">{plan.description}</p>
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={16} className="text-gray-900" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  variant={plan.variant} 
                  className="w-full h-12 text-sm font-bold rounded-2xl"
                  onClick={() => navigate(plan.name === 'Enterprise' ? '/login' : '/onboarding')}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-900 p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-8">Ready to listen to your users?</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
              Join 2,000+ companies using Hand Shake to build better products, together. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-16 px-10 text-base bg-white text-gray-900 hover:bg-gray-100 border-none rounded-2xl font-bold" onClick={() => navigate('/onboarding')}>
                Get Started for Free
              </Button>
              <Button variant="secondary" size="lg" className="h-16 px-10 text-base border-white/10 text-white hover:bg-white/5 rounded-2xl font-bold">
                Talk to an Expert
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                <span className="font-bold text-xl tracking-tight text-gray-900">Hand Shake</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs mb-8 font-medium">
                The modern feedback management platform for product teams who care about their users.
              </p>
              <div className="flex items-center gap-4">
                {['Twitter', 'GitHub', 'LinkedIn'].map(social => (
                  <div key={social} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
                    <Globe size={16} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Roadmap</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Feedback Portal</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Changelog</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li className="hover:text-gray-900 transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li className="hover:text-gray-900 transition-colors cursor-pointer"><Link to="/privacy">Privacy</Link></li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer"><Link to="/terms">Terms</Link></li>
                <li className="hover:text-gray-900 transition-colors cursor-pointer">Cookies</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 font-medium">&copy; 2026 Hand Shake Inc. Built with love by product enthusiasts.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
