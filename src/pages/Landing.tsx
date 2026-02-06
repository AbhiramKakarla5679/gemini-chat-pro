import { useState } from 'react';
import { MessageSquare, BookOpen, Brain, Target, Zap, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatOverlay } from '@/components/chat/ChatOverlay';

const Landing = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Notes',
      description: 'AI-powered notes tailored to you',
    },
    {
      icon: Brain,
      title: 'Smart Revision',
      description: 'Spaced repetition for retention',
    },
    {
      icon: Target,
      title: 'Practice',
      description: 'Questions with explanations',
    },
    {
      icon: Zap,
      title: 'Feedback',
      description: 'Real-time performance tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-bold">Chat</span>
      </button>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Beta</span>
          </div>

          {/* Title */}
          <h1 
            className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            <span className="text-foreground">SaveMyExams</span>
            <br />
            <span className="text-accent">Tutor</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            Your AI study companion for exam success.
          </p>

          {/* CTA */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: '300ms' }}
          >
            <Button
              onClick={() => setChatOpen(true)}
              size="lg"
              className="px-8 h-12 text-base font-bold rounded-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="px-8 h-12 text-base font-bold rounded-full text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center p-1.5">
            <div className="w-1 h-1.5 bg-muted-foreground rounded-full animate-float" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground">
              Tools designed for exam success.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300 opacity-0 animate-fade-up"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '50K+', label: 'Students' },
              { value: '98%', label: 'Pass Rate' },
              { value: '4.9', label: 'Rating' },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold">SaveMyExams Tutor</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 SaveMyExams. All rights reserved.</p>
        </div>
      </footer>

      <ChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Landing;