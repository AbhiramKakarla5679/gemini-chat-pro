import { ExternalLink, Globe } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  description?: string;
  domain: string;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function parseSources(text: string): { sources: Source[]; contentWithoutSources: string } {
  // Match the sources section at the end
  const sourcesRegex = /---\s*\n\*\*Sources:\*\*\s*\n([\s\S]*?)$/;
  const match = text.match(sourcesRegex);
  
  if (!match) return { sources: [], contentWithoutSources: text };
  
  const contentWithoutSources = text.replace(sourcesRegex, '').trim();
  const sourcesBlock = match[1];
  
  // Parse individual source lines: - [Title](url) — description  OR  - [Title](url)
  const sourceLines = sourcesBlock.split('\n').filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./));
  const sources: Source[] = [];
  
  for (const line of sourceLines) {
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)(?:\s*[—–-]\s*(.+))?/);
    if (linkMatch) {
      sources.push({
        title: linkMatch[1],
        url: linkMatch[2],
        description: linkMatch[3]?.trim(),
        domain: extractDomain(linkMatch[2]),
      });
    }
  }
  
  return { sources, contentWithoutSources };
}

export { parseSources };

export function SourceCards({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-rounded font-bold text-muted-foreground uppercase tracking-wider">
          {sources.length} {sources.length === 1 ? 'Source' : 'Sources'}
        </span>
      </div>
      <div className="space-y-2">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-xl glass-card hover:border-accent/30 transition-all duration-300 no-underline"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Globe className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-rounded font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {source.title}
              </div>
              {source.description && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {source.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                <span>{source.domain}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
