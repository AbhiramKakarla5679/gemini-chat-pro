import { useState } from 'react';
import { MessageSquare, BookOpen, Brain, Target, Zap, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatOverlay } from '@/components/chat/ChatOverlay';

const Landing = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Study Notes',
      description: 'AI-powered notes that adapt to your learning style',
    },
    {
      icon: Brain,
      title: 'Intelligent Revision',
      description: 'Spaced repetition optimized for exam success',
    },
    {
      icon: Target,
      title: 'Practice Questions',
      description: 'Thousands of questions with detailed explanations',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Real-time performance tracking and insights',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Discrete Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-1 group-hover:ml-0">
          Open Chat
        </span>
      </button>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold tracking-wide text-white/80">BETA</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight animate-fade-in font-display" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                SaveMyExams
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Tutor
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in font-rounded" style={{ animationDelay: '0.2s' }}>
              Your AI-powered study companion that helps you ace your exams with personalized tutoring and smart revision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button
                onClick={() => setChatOpen(true)}
                className="px-8 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
              >
                Start Learning
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="px-8 py-6 text-lg font-medium rounded-2xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-white/40 max-w-xl mx-auto">
                Powerful tools designed to transform how you study and retain information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white/90">{feature.title}</h3>
                  <p className="text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '50K+', label: 'Students' },
                { value: '98%', label: 'Pass Rate' },
                { value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-white/80 font-display">SaveMyExams Tutor</span>
            </div>
            <p className="text-sm text-white/30">© 2024 SaveMyExams Tutor. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Landing;
