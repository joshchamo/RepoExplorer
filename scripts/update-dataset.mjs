import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The GitHub token is automatically provided by GitHub Actions
const TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = path.join(__dirname, '../public/top_1000_os_github.csv');

async function fetchTopRepos() {
  let allRepos = [];
  
  console.log('Starting to fetch the top 1,000 GitHub repositories...');

  // GitHub Search API limits pagination to the first 1000 results.
  // We fetch 10 pages of 100 results each.
  for (let page = 1; page <= 10; page++) {
    console.log(`Fetching page ${page}/10...`);
    
    const response = await fetch(`https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=100&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Top-1000-Repos-Updater'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching page ${page}:`, response.statusText);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }

    const data = await response.json();
    allRepos = allRepos.concat(data.items);

    // Sleep for 5 seconds between requests to respect GitHub's strict Search API rate limits
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`Successfully fetched ${allRepos.length} repositories. Formatting data...`);

  // Define the exact CSV headers expected by our React frontend
  const headers = [
    'organization', 
    'repo_name', 
    'language', 
    'stars', 
    'forks', 
    'open_issues', 
    'age_days', 
    'description', 
    'has_coc', 
    'has_contributing', 
    'has_workflows',
    'homepage',
    'topics',
    'license',
    'last_updated'
  ];

  // Helper function to safely escape strings for CSV format
  const escapeCSV = (str) => {
    if (!str) return '""';
    const stringified = String(str).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  const csvRows = [headers.join(',')];

  allRepos.forEach(repo => {
    // Calculate repo age in days
    const ageDays = Math.floor((new Date() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24));
    const lastUpdatedDays = Math.floor((new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24));
    
    const row = [
      escapeCSV(repo.owner.login),
      escapeCSV(repo.name),
      escapeCSV(repo.language || 'Unknown'),
      repo.stargazers_count,
      repo.forks_count,
      repo.open_issues_count,
      ageDays,
      escapeCSV(repo.description),
      repo.has_issues ? 'true' : 'false',
      repo.has_projects ? 'true' : 'false',
      repo.has_downloads ? 'true' : 'false',
      escapeCSV(repo.homepage),
      escapeCSV((repo.topics || []).join('|')), // Join topics with a pipe character
      escapeCSV(repo.license ? repo.license.name : 'No License'),
      lastUpdatedDays
    ];
    
    csvRows.push(row.join(','));
  });

  // Ensure the public directory exists
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the new CSV file, overwriting the old one
  fs.writeFileSync(OUTPUT_FILE, csvRows.join('\n'), 'utf-8');
  console.log(`✅ Successfully wrote updated dataset to ${OUTPUT_FILE}`);
}

fetchTopRepos().catch(console.error);
