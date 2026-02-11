import { MessageSquare, BookOpen, Brain, Target, Zap, GraduationCap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Notes',
      description: 'AI-generated notes tailored to your syllabus and learning style.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Brain,
      title: 'Smart Revision',
      description: 'Spaced repetition algorithms that help you retain more, longer.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Target,
      title: 'Practice Questions',
      description: 'Exam-style questions with detailed step-by-step explanations.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Real-time performance tracking so you know where to focus.',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const benefits = [
    'Personalised to your exam board',
    'Available 24/7, learn at your pace',
    'Covers all major GCSE & A-Level subjects',
    'Trusted by thousands of students',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SaveMyExams</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/subjects')}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-5"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold tracking-wide text-accent">AI-Powered Learning</span>
          </div>

          {/* Title */}
          <h1 
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 opacity-0 animate-fade-up leading-[1.1]"
            style={{ animationDelay: '80ms' }}
          >
            Study smarter,{' '}
            <span className="text-accent">ace your exams</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Your personal AI tutor that adapts to how you learn. Notes, revision, and practice — all in one place.
          </p>

          {/* CTA */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Button
              onClick={() => navigate('/subjects')}
              size="lg"
              className="px-8 h-13 text-base font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/25"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/chat')}
              className="px-8 h-13 text-base font-bold rounded-2xl border-border hover:bg-secondary transition-all duration-300"
            >
              Try AI Chat
            </Button>
          </div>

          {/* Benefits list */}
          <div 
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 opacity-0 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Powerful tools designed to make studying efficient and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-up"
                style={{ animationDelay: `${400 + index * 80}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border bg-card p-12 md:p-16">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '50K+', label: 'Students helped' },
                { value: '98%', label: 'Pass rate' },
                { value: '4.9★', label: 'Average rating' },
              ].map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="opacity-0 animate-fade-up"
                  style={{ animationDelay: `${700 + index * 80}ms` }}
                >
                  <div className="text-3xl md:text-5xl font-black text-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Ready to start studying?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of students already using AI to boost their grades.
          </p>
          <Button
            onClick={() => navigate('/subjects')}
            size="lg"
            className="px-10 h-13 text-base font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-[1.02]"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold">SaveMyExams Tutor</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 SaveMyExams. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
