import { Link } from 'react-router-dom';
import { BookOpen, Target, Zap, Users, BarChart3, GripVertical, LayoutDashboard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../hooks/useAuth';

export default function LandingPage() {
  const { data: user } = useUser();

  return (
    <div className="relative">
      <Helmet>
        <title>AlgoForge — DSA Preparation Platform</title>
      </Helmet>
      
      {/* Hero Section */}
      <section className="pt-24 pb-32 px-6 relative z-10 max-w-7xl mx-auto text-center">
        <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> The ultimate DSA prep platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-text-main tracking-tight leading-[1.1]">
            Forge your path to <br className="hidden md:block" />
            <span className="text-gradient">algorithmic mastery</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Track your progress, identify weak areas, and ace your technical interviews with our intelligent spaced-repetition system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/app/dashboard" className="btn-primary text-lg px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2">
                <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-lg px-8 py-3 w-full sm:w-auto">Start Forging Free</Link>
            )}
            <Link to="/app/discover" className="btn-secondary text-lg px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" /> Explore Sheets
            </Link>
          </div>
        </div>

        {/* Floating Mockup */}
        <div className="mt-20 relative mx-auto w-full max-w-5xl animate-float">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-10 bottom-[-10px] h-[30%]" style={{top: 'auto'}} />
          <div className="glass rounded-xl overflow-hidden border border-border-dark shadow-2xl relative z-0">
             {/* Fake browser header */}
             <div className="bg-bg-elevated border-b border-border-dark p-3 flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-danger/80" />
               <div className="w-3 h-3 rounded-full bg-warning/80" />
               <div className="w-3 h-3 rounded-full bg-success/80" />
               <div className="mx-auto bg-bg-dark rounded px-4 text-xs text-text-muted py-1 flex-1 max-w-sm text-center">app.algoforge.com</div>
             </div>
             {/* Fake app content */}
             <div className="p-6 md:p-10 bg-bg-dark grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="h-8 w-48 bg-border-dark rounded animate-pulse" />
                  <div className="card p-4 flex gap-4">
                     <div className="w-10 h-10 rounded bg-brand-primary/20" />
                     <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-border-dark rounded" />
                        <div className="h-3 w-1/2 bg-border-dark/50 rounded" />
                     </div>
                  </div>
                  <div className="card p-4 flex gap-4">
                     <div className="w-10 h-10 rounded bg-brand-accent/20" />
                     <div className="space-y-2 flex-1">
                        <div className="h-4 w-2/3 bg-border-dark rounded" />
                        <div className="h-3 w-1/3 bg-border-dark/50 rounded" />
                     </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="card p-6 aspect-square flex flex-col items-center justify-center gap-2">
                     <div className="w-24 h-24 rounded-full border-4 border-brand-primary border-t-border-dark" />
                     <div className="h-4 w-16 bg-border-dark rounded mt-2" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-bg-elevated border-y border-border-dark relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">Everything you need to succeed</h2>
            <p className="text-text-muted">Built for software engineers, by software engineers. Stop losing track of what you've studied.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<GripVertical className="text-brand-primary" />}
              title="Hierarchical Tracking"
              desc="Organize your curriculum into topics, subtopics, and questions. Drag and drop to reorder anytime."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-brand-accent" />}
              title="Deep Analytics"
              desc="Visualize your progress with activity heatmaps, topic mastery radar charts, and weekly velocity metrics."
            />
            <FeatureCard 
              icon={<Zap className="text-warning" />}
              title="Spaced Repetition"
              desc="Our SM-2 based algorithm schedules questions for review right when you're about to forget them."
            />
            <FeatureCard 
              icon={<Target className="text-success" />}
              title="Targeted Practice"
              desc="Get daily practice plans automatically generated to focus on your weak areas and upcoming reviews."
            />
            <FeatureCard 
              icon={<Users className="text-indigo-500" />}
              title="Study Groups"
              desc="Create study groups with your friends, share invite codes, and compete on weekly leaderboards."
            />
            <FeatureCard 
              icon={<BookOpen className="text-pink-500" />}
              title="Public Templates"
              desc="Publish your sheet as a public template, or browse curated sheets created by the community."
            />
          </div>
        </div>
      </section>

      {/* Stats / Final CTA */}
      <section className="py-24 px-6 relative z-10 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-text-main mb-6">Ready to crush your interviews?</h2>
        <p className="text-xl text-text-muted mb-10">Join the platform that helps you study smarter, not harder.</p>
        {user ? (
          <Link to="/app/dashboard" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            Go to Dashboard <Zap className="w-5 h-5" />
          </Link>
        ) : (
          <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            Get Started For Free <Zap className="w-5 h-5" />
          </Link>
        )}
      </section>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="card card-hover p-6">
      <div className="w-12 h-12 rounded-xl bg-bg-dark border border-border-dark flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
