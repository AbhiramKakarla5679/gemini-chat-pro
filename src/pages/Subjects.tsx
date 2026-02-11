import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Code, Atom, FlaskConical, Calculator, BookOpen, 
  Brain, Dna, Globe, Lightbulb, FileText, PenTool, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const subjects = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: Code,
    color: 'from-yellow-500/20 to-yellow-600/5',
    borderColor: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
    topics: ['Variables & Types', 'Functions', 'Async/Await', 'DOM', 'ES6+'],
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: Atom,
    color: 'from-blue-500/20 to-blue-600/5',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    topics: ['Mechanics', 'Waves', 'Electricity', 'Nuclear', 'Thermodynamics'],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: FlaskConical,
    color: 'from-green-500/20 to-green-600/5',
    borderColor: 'border-green-500/20',
    iconColor: 'text-green-400',
    topics: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: Calculator,
    color: 'from-purple-500/20 to-purple-600/5',
    borderColor: 'border-purple-500/20',
    iconColor: 'text-purple-400',
    topics: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry'],
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: Dna,
    color: 'from-emerald-500/20 to-emerald-600/5',
    borderColor: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    topics: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Anatomy'],
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: Globe,
    color: 'from-cyan-500/20 to-cyan-600/5',
    borderColor: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    topics: ['Physical', 'Human', 'Environmental', 'Cartography', 'Climate'],
  },
];

type StudyMode = {
  id: string;
  name: string;
  description: string;
  icon: typeof BookOpen;
};

const studyModes: StudyMode[] = [
  { id: 'revision', name: 'Revision Notes', description: 'Condensed notes for quick review', icon: FileText },
  { id: 'practice', name: 'Practice Questions', description: 'Test your knowledge', icon: PenTool },
  { id: 'explain', name: 'Explain Topic', description: 'In-depth AI explanations', icon: Lightbulb },
  { id: 'quiz', name: 'Quick Quiz', description: 'Multiple choice questions', icon: HelpCircle },
];

const Subjects = () => {
  const navigate = useNavigate();
  // Study mode buttons are disabled for now

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9 rounded-xl glass-button text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-display font-black liquid-text">Start Learning</h1>
              <p className="text-xs text-muted-foreground font-rounded">Choose a subject to begin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Subjects Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject, i) => (
            <div
              key={subject.id}
              className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
            >
              {/* Subject Header */}
              <div className={`p-5 bg-gradient-to-br ${subject.color} border-b border-border/30`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl glass-button flex items-center justify-center ${subject.borderColor}`}>
                    <subject.icon className={`w-5 h-5 ${subject.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground font-rounded">{subject.topics.length} topics</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subject.topics.map((topic) => (
                    <span 
                      key={topic} 
                      className="px-2.5 py-1 rounded-lg text-[10px] font-rounded font-bold text-muted-foreground glass-button"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Mode Buttons */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {studyModes.map((mode) => (
                  <div
                    key={mode.id}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-button text-left opacity-60 cursor-not-allowed"
                  >
                    <mode.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-rounded font-bold text-foreground truncate">{mode.name}</p>
                      <p className="text-[10px] text-muted-foreground font-rounded truncate">{mode.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Subjects;
