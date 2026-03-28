/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Grid, List, ChevronDown, Book, Star, GitFork, CircleDot, Clock, Shield, CheckCircle, X, ExternalLink, Activity } from 'lucide-react';
import { Repo, fallbackData } from './data';
import { cn } from './lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'stars' | 'forks' | 'issues' | 'age';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Markdown: '#083fa1',
};

export default function App() {
  const [data, setData] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('stars');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/top_1000_os_github.csv');
        if (response.ok) {
          const csvText = await response.text();
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              setData(results.data as Repo[]);
              setLoading(false);
            },
          });
        } else {
          setData(fallbackData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load CSV, using fallback", error);
        setData(fallbackData);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const VersionControlIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="50" cy="14" r="10" />
    <line x1="50" y1="24" x2="50" y2="76" />
    <circle cx="50" cy="86" r="10" />
    <path d="M 50 38 L 22 52 L 22 62" />
    <circle cx="22" cy="72" r="10" />
    <path d="M 50 62 L 78 48 L 78 38" />
    <circle cx="78" cy="28" r="10" />
  </svg>
  );

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo => {
        // Simple search logic. Could be extended to support "lang:rust" etc.
        if (query.startsWith('lang:')) {
          const lang = query.split(':')[1]?.trim() || '';
          return repo.language ? String(repo.language).toLowerCase().includes(lang) : false;
        }
        
        // FIX: Safely convert everything to a string first so numbers don't crash the app
        const nameMatch = String(repo.repo_name || '').toLowerCase().includes(query);
        const descMatch = String(repo.description || '').toLowerCase().includes(query);
        const langMatch = String(repo.language || '').toLowerCase().includes(query);
        
        return nameMatch || descMatch || langMatch;
      });
    }

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'stars': return (b.stars || 0) - (a.stars || 0);
        case 'forks': return (b.forks || 0) - (a.forks || 0);
        case 'issues': return (b.open_issues || 0) - (a.open_issues || 0);
        case 'age': return (a.age_days || 0) - (b.age_days || 0);
        default: return 0;
      }
    });
  }, [data, searchQuery, sortOption]);

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatAge = (days: number) => {
    if (!days) return 'Unknown';
    if (days < 365) return `${Math.floor(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  };

  const resetApp = () => {
    setSearchQuery('');
    setSortOption('stars');
    setSelectedRepo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] font-sans selection:bg-[#3d93f5]/30 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#30363D] bg-[#161B22] px-6 lg:px-10 py-4 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={resetApp}
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity cursor-pointer text-left">
            <VersionControlIcon className="w-6 h-6 text-[#3d93f5]" />
            <h1 className="text-lg font-bold tracking-tight">RepoExplorer</h1>
          </button>
        </div>

        <div className="flex-1 max-w-xl w-full">
          <div className="relative group flex items-center w-full h-9 rounded-md border border-[#30363D] bg-[#0D1117] focus-within:border-[#3d93f5] focus-within:ring-1 focus-within:ring-[#3d93f5] transition-all">
            <Search className="w-4 h-4 text-[#8B949E] ml-3" />
            <input
              type="text"
              className="flex-1 bg-transparent border-none text-[#C9D1D9] focus:outline-none focus:ring-0 h-full px-3 text-sm font-mono placeholder:text-[#8B949E]"
              placeholder="Search repositories (e.g. lang:rust)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#8B949E]">
            <span>Sort:</span>
            <select 
              className="bg-transparent border-none text-white focus:ring-0 cursor-pointer font-medium p-0"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="stars" className="bg-[#161B22]">Stars</option>
              <option value="forks" className="bg-[#161B22]">Forks</option>
              <option value="issues" className="bg-[#161B22]">Issues</option>
              <option value="age" className="bg-[#161B22]">Age</option>
            </select>
          </div>

          <div className="flex border border-[#30363D] rounded-md bg-[#0D1117] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'grid' ? "bg-[#161B22] text-white shadow-sm" : "text-[#8B949E] hover:text-white")}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'list' ? "bg-[#161B22] text-white shadow-sm" : "text-[#8B949E] hover:text-white")}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Top Repositories</h2>
            <div className="text-sm text-[#8B949E] font-mono">
              Showing {filteredAndSortedData.length} results
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#8B949E]">Loading data...</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedData.map((repo, i) => (
                <article
                  key={i}
                  onClick={() => setSelectedRepo(repo)}
                  className="flex flex-col h-[200px] bg-[#161B22] border border-[#30363D] rounded-lg relative overflow-hidden group hover:border-[#8B949E] cursor-pointer transition-colors"
                >
                  <div className="absolute top-3 right-3 flex gap-1.5 items-center">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] px-2 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8B949E' }} />
                        <span className="text-[11px] text-[#8B949E] font-mono">{repo.language}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 pr-16">
                      <Book className="w-4 h-4 text-[#8B949E] shrink-0" />
                      <h3 className="text-[15px] font-semibold text-[#3d93f5] group-hover:underline truncate">
                        {repo.organization}/{repo.repo_name}
                      </h3>
                    </div>
                    <p className="text-[13px] text-[#C9D1D9] line-clamp-3 leading-relaxed mb-3">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="h-10 border-t border-[#30363D] flex items-center px-4 bg-[#0D1117]/50 justify-between shrink-0">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-[#8B949E]" title="Stars">
                        <Star className="w-3.5 h-3.5" />
                        <span className="font-mono text-[12px] text-[#C9D1D9]">{formatNumber(repo.stars)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8B949E]" title="Forks">
                        <GitFork className="w-3.5 h-3.5" />
                        <span className="font-mono text-[12px] text-[#C9D1D9]">{formatNumber(repo.forks)}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8B949E] font-mono">{formatAge(repo.age_days)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-[#30363D] rounded-lg bg-[#161B22] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#161B22] border-b border-[#30363D]">
                  <tr>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[250px]">Repository</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[120px]">Language</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[100px] text-right">Stars</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[100px] text-right">Forks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]">
                  {filteredAndSortedData.map((repo, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedRepo(repo)}
                      className="hover:bg-[#1C2128] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-[#8B949E]" />
                          <span className="text-[#3d93f5] text-sm font-medium group-hover:underline truncate block w-full">
                            {repo.organization}/{repo.repo_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#8B949E] text-sm truncate max-w-[400px]">
                          {repo.description}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8B949E' }} />
                            <span className="text-sm text-[#C9D1D9]">{repo.language}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-[#C9D1D9]">{formatNumber(repo.stars)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-[#C9D1D9]">{formatNumber(repo.forks)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Quick Look Panel */}
      {selectedRepo && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedRepo(null)}
          />
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#161B22] border-l border-[#30363D] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <header className="h-[72px] flex items-center justify-between px-6 border-b border-[#30363D] shrink-0">
              <div className="flex flex-col truncate pr-4">
                <div className="flex items-center gap-2 truncate">
                  <Book className="w-5 h-5 text-[#8B949E] shrink-0" />
                  <h2 className="text-lg font-semibold text-white truncate">
                    {selectedRepo.organization}/{selectedRepo.repo_name}
                  </h2>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-[#238636]/20 text-[#3FB950] border border-[#238636]/30 font-medium uppercase tracking-tight">
                    <CheckCircle className="w-3 h-3" /> Build Passing
                  </span>
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-[#3d93f5]/20 text-[#3d93f5] border border-[#3d93f5]/30 font-medium uppercase tracking-tight">
                    <Shield className="w-3 h-3" /> Secured
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRepo(null)}
                className="text-[#8B949E] hover:text-white p-1.5 rounded-md hover:bg-[#30363D]/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-[14px] text-[#C9D1D9] leading-relaxed">
                  {selectedRepo.description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-[#8B949E]">
                    <Star className="w-4 h-4" /> <span className="font-mono text-white">{formatNumber(selectedRepo.stars)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#8B949E]">
                    <GitFork className="w-4 h-4" /> <span className="font-mono text-white">{formatNumber(selectedRepo.forks)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#8B949E]">
                    <CircleDot className="w-4 h-4" /> <span className="font-mono text-white">{formatNumber(selectedRepo.open_issues)}</span>
                  </span>
                </div>
              </div>

              {selectedRepo.language && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Languages</h3>
                  <div className="h-2 w-full rounded-full bg-[#30363D] overflow-hidden flex">
                    <div className="h-full" style={{ width: '100%', backgroundColor: LANGUAGE_COLORS[selectedRepo.language] || '#8B949E' }}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[selectedRepo.language] || '#8B949E' }} />
                    <span className="text-xs text-[#C9D1D9] font-medium">{selectedRepo.language} <span className="text-white">100%</span></span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Age
                  </span>
                  <span className="text-[15px] font-bold text-white mono-text">{formatAge(selectedRepo.age_days)}</span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Code of Conduct
                  </span>
                  <span className={cn("text-[15px] font-bold mono-text", selectedRepo.has_coc ? "text-[#3FB950]" : "text-[#8B949E]")}>
                    {selectedRepo.has_coc ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Workflows
                  </span>
                  <span className={cn("text-[15px] font-bold mono-text", selectedRepo.has_workflows ? "text-[#3FB950]" : "text-[#8B949E]")}>
                    {selectedRepo.has_workflows ? 'Active' : 'None'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Contributing
                  </span>
                  <span className={cn("text-[15px] font-bold mono-text", selectedRepo.has_contributing ? "text-[#3FB950]" : "text-[#8B949E]")}>
                    {selectedRepo.has_contributing ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Project Velocity</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 border border-[#30363D] bg-[#0D1117]/50 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#8B949E]">Issue Ratio</span>
                      <span className="text-[13px] font-medium text-[#C9D1D9]">{formatNumber(selectedRepo.open_issues)} Open</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-bold text-[#3FB950]">Healthy</span>
                      <span className="block text-[10px] text-[#8B949E]">Resolution Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a 
                  href={`https://github.com/${selectedRepo.organization}/${selectedRepo.repo_name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

