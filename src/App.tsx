/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import Markdown from 'react-markdown';
import { Search, Grid, List, ChevronDown, Book, Star, GitFork, CircleDot, Clock, Shield, CheckCircle, X, ExternalLink, Activity, Info, ArrowUp, ArrowDown } from 'lucide-react';
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

export default function App() {
  const [data, setData] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('stars');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);

  useEffect(() => {
    setReadmeContent(null);
    setReadmeError(null);
    setReadmeLoading(false);
  }, [selectedRepo]);

  const fetchReadme = async (repo: Repo) => {
    setReadmeLoading(true);
    setReadmeError(null);
    try {
      const pathsToTry = [
        'main/README.md',
        'master/README.md',
        'main/readme.md',
        'master/readme.md',
        'main/Readme.md',
        'master/Readme.md',
        'main/README.MD',
        'master/README.MD',
        'main/README',
        'master/README',
        'main/README.rst',
        'master/README.rst',
        'main/README.txt',
        'master/README.txt'
      ];

      let text = '';
      let found = false;

      for (const path of pathsToTry) {
        const res = await fetch(`https://raw.githubusercontent.com/${repo.organization}/${repo.repo_name}/${path}`);
        if (res.ok) {
          text = await res.text();
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error('README not found');
      }
      
      let cleanedText = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
      
      // Remove <div align="center"> and <p align="center"> blocks (often used for logos/badges)
      const removeBlock = (tagName: string) => {
        const regex = new RegExp(`<${tagName}[^>]*align="center"[^>]*>`, 'i');
        let match = cleanedText.match(regex);
        let iterations = 0;
        while (match && iterations < 10) { // prevent infinite loops
          iterations++;
          const startIndex = match.index!;
          let depth = 1;
          let i = startIndex + match[0].length;
          
          while (depth > 0 && i < cleanedText.length) {
            if (cleanedText.substring(i, i + tagName.length + 1).toLowerCase() === `<${tagName}`) {
              depth++;
              i += tagName.length + 1;
            } else if (cleanedText.substring(i, i + tagName.length + 2).toLowerCase() === `</${tagName}`) {
              depth--;
              i += tagName.length + 2;
              while (i < cleanedText.length && cleanedText[i] !== '>') i++;
              if (i < cleanedText.length && cleanedText[i] === '>') i++;
            } else {
              i++;
            }
          }
          cleanedText = cleanedText.substring(0, startIndex) + cleanedText.substring(i);
          match = cleanedText.match(regex);
        }
      };

      removeBlock('div');
      removeBlock('p');

      cleanedText = cleanedText
        .replace(/<[^>]*>?/gm, '') // Remove remaining HTML tags
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
        .replace(/\[\]\([^)]*\)/g, '') // Remove empty markdown links
        .replace(/&lt;/g, '<') // Decode HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&middot;/g, '·')
        .replace(/&#x200B;/g, '')
        .trim();
        
      if (!cleanedText) {
        throw new Error('README is empty or contains no readable text.');
      }
        
      setReadmeContent(cleanedText.slice(0, 2000) + (cleanedText.length > 2000 ? '\n\n...' : ''));
    } catch (err) {
      setReadmeError('Could not load README snippet.');
    } finally {
      setReadmeLoading(false);
    }
  };

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

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo => {
        // Simple search logic. Could be extended to support "lang:rust" etc.
        if (query.startsWith('lang:')) {
          const lang = query.split(':')[1]?.trim() || '';
          return repo.language ? String(repo.language).toLowerCase().includes(lang) : false;
        }
        
        const nameMatch = String(repo.repo_name || '').toLowerCase().includes(query);
        const descMatch = String(repo.description || '').toLowerCase().includes(query);
        const langMatch = String(repo.language || '').toLowerCase().includes(query);
        
        return nameMatch || descMatch || langMatch;
      });
    }

    return filtered.sort((a, b) => {
      let result = 0;
      switch (sortOption) {
        case 'stars': result = (b.stars || 0) - (a.stars || 0); break;
        case 'forks': result = (b.forks || 0) - (a.forks || 0); break;
        case 'issues': result = (b.open_issues || 0) - (a.open_issues || 0); break;
        case 'age': result = (a.age_days || 0) - (b.age_days || 0); break;
        default: result = 0; break;
      }
      return sortDirection === 'asc' ? -result : result;
    });
  }, [data, searchQuery, sortOption, sortDirection]);

  const formatNumber = (num: number | string) => {
    const n = Number(num);
    if (!n || isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  const formatAge = (days: number | string) => {
    const d = Number(days);
    if (!d || isNaN(d)) return 'Unknown';
    if (d < 365) return `${Math.floor(d / 30)}mo`;
    return `${(d / 365).toFixed(1)}y`;
  };

  const resetApp = () => {
    setSearchQuery('');
    setSortOption('stars');
    setSelectedRepo(null);
    setReadmeContent(null);
    setReadmeError(null);
    setReadmeLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRepoSelect = (repo: Repo) => {
    setSelectedRepo(repo);
    setReadmeContent(null);
    setReadmeError(null);
    setReadmeLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] font-sans selection:bg-[#3d93f5]/30 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#30363D] bg-[#161B22] px-6 lg:px-10 py-4 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={resetApp}
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
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
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#8B949E] hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-[#30363D]/50"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </button>
          
          <div className="w-px h-5 bg-[#30363D] hidden sm:block"></div>

          <div className="flex items-center gap-1 text-sm text-[#8B949E]">
            <span className="mr-1">Sort:</span>
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
            <button
              onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-1 hover:text-white transition-colors ml-1 rounded-md hover:bg-[#30363D]/50"
              title={sortDirection === 'desc' ? "Descending" : "Ascending"}
            >
              {sortDirection === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
            </button>
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Top Repositories</h2>
              <p className="text-sm text-[#8B949E] mt-1">Explore the top 1000 most-starred public repositories on GitHub</p>
            </div>
            <div className="text-sm text-[#8B949E] font-mono shrink-0">
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
                  onClick={() => handleRepoSelect(repo)}
                  className="flex flex-col h-[200px] bg-[#161B22] border border-[#30363D] rounded-lg relative overflow-hidden group hover:border-[#8B949E] cursor-pointer transition-colors"
                >
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="w-4 h-4 text-[#8B949E] shrink-0" />
                      <h3 className="text-[15px] font-semibold text-[#3d93f5] group-hover:underline truncate" title={`${repo.organization}/${repo.repo_name}`}>
                        {String(repo.organization).toLowerCase() === String(repo.repo_name).toLowerCase() ? repo.repo_name : `${repo.organization}/${repo.repo_name}`}
                      </h3>
                    </div>
                    <p className="text-[13px] text-[#C9D1D9] line-clamp-3 leading-relaxed mb-3">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div 
                    className="h-10 border-t flex items-center px-4 bg-[#0D1117]/50 justify-between shrink-0"
                    style={{ borderTopColor: repo.language ? (LANGUAGE_COLORS[repo.language] || '#30363D') : '#30363D' }}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-1.5 text-[#e3b341]" title="Stars">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono text-[12px] font-medium">{formatNumber(repo.stars)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8B949E]" title="Forks">
                        <GitFork className="w-3.5 h-3.5" />
                        <span className="font-mono text-[12px] text-[#C9D1D9]">{formatNumber(repo.forks)}</span>
                      </div>
                      {repo.language && (
                        <div className="flex items-center gap-1.5 ml-1" title="Language">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8B949E' }} />
                          <span className="text-[11px] text-[#8B949E] font-mono">{repo.language}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8B949E] font-mono">{formatAge(repo.age_days)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-[#30363D] rounded-lg bg-[#161B22] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                <thead className="bg-[#161B22] border-b border-[#30363D]">
                  <tr>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[35%]">Repository</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[40%]">Description</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[10%]">Language</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[7.5%] text-right">Stars</th>
                    <th className="px-4 py-3 text-[#8B949E] text-xs font-semibold uppercase tracking-wider w-[7.5%] text-right">Forks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]">
                  {filteredAndSortedData.map((repo, i) => (
                    <tr 
                      key={i} 
                      onClick={() => handleRepoSelect(repo)}
                      className="hover:bg-[#1C2128] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 overflow-hidden">
                        <div className="flex items-center gap-2 truncate">
                          <Book className="w-4 h-4 text-[#8B949E] shrink-0" />
                          <span className="text-[#3d93f5] text-sm font-medium group-hover:underline truncate" title={`${repo.organization}/${repo.repo_name}`}>
                            {String(repo.organization).toLowerCase() === String(repo.repo_name).toLowerCase() ? repo.repo_name : `${repo.organization}/${repo.repo_name}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 overflow-hidden">
                        <p className="text-[#8B949E] text-sm line-clamp-2" title={repo.description}>
                          {repo.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 overflow-hidden">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8B949E' }} />
                            <span className="text-sm text-[#C9D1D9]">{repo.language}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right overflow-hidden">
                        <div className="flex items-center justify-end gap-1.5 text-[#e3b341]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-mono text-sm font-medium">{formatNumber(repo.stars)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right overflow-hidden">
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
                  <span className="flex items-center gap-1.5 text-sm text-[#e3b341]">
                    <Star className="w-4 h-4 fill-current" /> <span className="font-mono font-medium">{formatNumber(selectedRepo.stars)}</span>
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

              {/* Topics / Tags */}
              {selectedRepo.topics && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {String(selectedRepo.topics).split('|').filter(Boolean).slice(0, 8).map((topic, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-[#3d93f5]/10 text-[#3d93f5] text-[11px] font-medium border border-[#3d93f5]/20">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Last Updated
                  </span>
                  <span className="text-[14px] font-bold text-white mono-text">
                    {selectedRepo.last_updated === 0 ? 'Today' : `${selectedRepo.last_updated} days ago`}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> License
                  </span>
                  <span className="text-[13px] font-bold text-[#C9D1D9] truncate" title={selectedRepo.license}>
                    {selectedRepo.license || 'None'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Age
                  </span>
                  <span className="text-[14px] font-bold text-white mono-text">{formatAge(selectedRepo.age_days)}</span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg p-3 border border-[#30363D] bg-[#0D1117]">
                  <span className="text-[11px] text-[#8B949E] uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Workflows
                  </span>
                  <span className={cn("text-[14px] font-bold mono-text", selectedRepo.has_workflows ? "text-[#3FB950]" : "text-[#8B949E]")}>
                    {selectedRepo.has_workflows ? 'Active' : 'None'}
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

              <div className="space-y-3 pt-4 border-t border-[#30363D]">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">README Snippet</h3>
                {!readmeContent && !readmeLoading && !readmeError && (
                  <button
                    onClick={() => fetchReadme(selectedRepo)}
                    className="w-full bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-sm font-medium py-2 px-4 rounded-md transition-colors border border-[#30363D]"
                  >
                    Load README Snippet
                  </button>
                )}
                {readmeLoading && (
                  <div className="text-sm text-[#8B949E] text-center py-2">Loading snippet...</div>
                )}
                {readmeError && (
                  <div className="text-sm text-[#F85149] text-center py-2">{readmeError}</div>
                )}
                {readmeContent && (
                  <div className="relative bg-[#0D1117] border border-[#30363D] rounded-lg p-4 overflow-hidden max-h-[400px]">
                    <div className="text-sm text-[#C9D1D9] font-sans text-[13px] leading-relaxed [&_a]:text-[#3d93f5] [&_a]:hover:underline [&_h1]:font-bold [&_h1]:text-base [&_h1]:mb-2 [&_h1]:mt-4 first:[&_h1]:mt-0 [&_h2]:font-semibold [&_h2]:text-sm [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:font-medium [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-3 [&_code]:bg-[#161B22] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-[#161B22] [&_pre]:p-2 [&_pre]:rounded [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-[#30363D] [&_blockquote]:pl-3 [&_blockquote]:text-[#8B949E] [&_table]:w-full [&_table]:mb-3 [&_th]:border-b [&_th]:border-[#30363D] [&_th]:text-left [&_th]:pb-1 [&_td]:border-b [&_td]:border-[#30363D]/50 [&_td]:py-1">
                      <Markdown
                        components={{
                          a: ({ href, children, ...props }) => {
                            let absoluteHref = href;
                            if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
                              const repoUrl = `https://github.com/${selectedRepo.organization}/${selectedRepo.repo_name}`;
                              if (href.startsWith('#')) {
                                absoluteHref = `${repoUrl}${href}`;
                              } else if (href.startsWith('/')) {
                                absoluteHref = `${repoUrl}/tree/main${href}`;
                              } else {
                                absoluteHref = `${repoUrl}/tree/main/${href}`;
                              }
                            }
                            return (
                              <a href={absoluteHref} target="_blank" rel="noreferrer" {...props}>
                                {children}
                              </a>
                            );
                          }
                        }}
                      >
                        {readmeContent}
                      </Markdown>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D1117] to-transparent rounded-b-lg"></div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-[#30363D]">
                {selectedRepo.homepage && (
                  <a
                    href={String(selectedRepo.homepage).startsWith('http') ? String(selectedRepo.homepage) : `https://${selectedRepo.homepage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#30363D] hover:bg-[#3d93f5] text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                <a
                  href={`https://github.com/${selectedRepo.organization}/${selectedRepo.repo_name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors border border-[rgba(240,246,252,0.1)]">
                  <Book className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* About Modal */}
      {showAbout && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowAbout(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#161B22] border border-[#30363D] shadow-2xl z-50 rounded-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363D] shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#3d93f5]" />
                <h2 className="text-lg font-semibold text-white">About RepoExplorer</h2>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="text-[#8B949E] hover:text-white p-1.5 rounded-md hover:bg-[#30363D]/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-6 text-[#C9D1D9] text-sm leading-relaxed">
              <div className="space-y-4">
                <p>
                  <strong>RepoExplorer</strong> is a responsive, interactive dashboard for exploring, searching, and analyzing the top 1000 most-starred public repositories on GitHub.
                </p>
                <p>
                  Built as a project to explore data pipelines, UI state management, and automated data refresh workflows.
                </p>

                <h3 className="text-white font-semibold text-base mt-6 flex items-center gap-2">
                  <span>📊</span> Data Source & Automation
                </h3>
                <p>
                  This project's UI was initially designed around the Kaggle dataset, <em>The Top-1000 GitHub Repositories</em>, which provides structured information on the 1000 most‑starred public repositories on GitHub.
                </p>
                <p>
                  To keep the data current, the project evolved into an automated pipeline. A GitHub Actions workflow runs weekly, fetching updated data from the GitHub API and regenerating the dataset. This ensures the dashboard reflects the latest state of the open-source ecosystem.
                </p>

                <h3 className="text-white font-semibold text-base mt-6 flex items-center gap-2">
                  <span>✨</span> Features
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Rich Data Display:</strong> View comprehensive details for each repository, including language, star count, forks, open issues, age, license, topics/tags, and workflow status.</li>
                  <li><strong className="text-white">Quick Look Panel:</strong> Click on any repository to slide out a detailed side panel with extended metadata, project velocity metrics, and direct links to the repository and homepage.</li>
                  <li><strong className="text-white">Flexible Layouts:</strong> Toggle seamlessly between a dense, data-rich List View and a highly visual Grid View (Cards).</li>
                  <li><strong className="text-white">Advanced Searching:</strong> Instantly filter repositories by name, description, or language. You can even use specific prefixes like <code className="bg-[#30363D] px-1.5 py-0.5 rounded text-[#3d93f5]">lang:rust</code> or <code className="bg-[#30363D] px-1.5 py-0.5 rounded text-[#3d93f5]">python</code>.</li>
                  <li><strong className="text-white">Dynamic Sorting:</strong> Sort the top 1000 repositories by Stars, Forks, Open Issues, or Age.</li>
                  <li><strong className="text-white">Fully Responsive:</strong> Carefully crafted with Tailwind CSS to provide a perfect viewing experience on mobile, tablet, and ultra-wide desktop displays.</li>
                </ul>

                <h3 className="text-white font-semibold text-base mt-6 flex items-center gap-2">
                  <span>🛠️</span> Tech Stack
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Frontend Framework:</strong> React 18 with TypeScript</li>
                  <li><strong className="text-white">Build Tool:</strong> Vite</li>
                  <li><strong className="text-white">Styling:</strong> Tailwind CSS</li>
                  <li><strong className="text-white">Icons:</strong> Lucide React</li>
                  <li><strong className="text-white">Data Parsing:</strong> PapaParse (for client-side CSV processing)</li>
                  <li><strong className="text-white">Automation:</strong> GitHub Actions (Weekly Cron Job)</li>
                </ul>

                <h3 className="text-white font-semibold text-base mt-6 flex items-center gap-2">
                  <span>🔗</span> Contact & Source
                </h3>
                <p>
                  <strong>GitHub Repository:</strong> <a href="https://github.com/joshchamo/RepoExplorer/" target="_blank" rel="noreferrer" className="text-[#3d93f5] hover:underline">https://github.com/joshchamo/RepoExplorer/</a>
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:joshchamo@gmail.com" className="text-[#3d93f5] hover:underline">joshchamo@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
