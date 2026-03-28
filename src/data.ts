export interface Repo {
  repo_name: string;
  organization: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  age_days: number;
  has_coc: boolean;
  has_contributing: boolean;
  has_workflows: boolean;
  has_readme: boolean;
  description: string;
}

export const fallbackData: Repo[] = [
  { repo_name: "build-your-own-x", organization: "codecrafters-io", language: "Markdown", stars: 465892, forks: 43725, open_issues: 474, age_days: 2838, has_coc: false, has_contributing: false, has_workflows: false, has_readme: true, description: "Master programming by recreating your favorite technologies from scratch." },
  { repo_name: "awesome", organization: "sindresorhus", language: "", stars: 437387, forks: 33176, open_issues: 72, age_days: 4236, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "😎 Awesome lists about all kinds of interesting topics" },
  { repo_name: "freeCodeCamp", organization: "freeCodeCamp", language: "TypeScript", stars: 437065, forks: 43374, open_issues: 323, age_days: 4069, has_coc: false, has_contributing: false, has_workflows: true, has_readme: true, description: "freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming, and computer science for free." },
  { repo_name: "public-apis", organization: "public-apis", language: "Python", stars: 398362, forks: 42615, open_issues: 843, age_days: 3617, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "A collective list of free APIs" },
  { repo_name: "free-programming-books", organization: "EbookFoundation", language: "Python", stars: 382530, forks: 65905, open_issues: 72, age_days: 4509, has_coc: false, has_contributing: false, has_workflows: true, has_readme: true, description: "📚 Freely available programming books" },
  { repo_name: "developer-roadmap", organization: "kamranahmedse", language: "TypeScript", stars: 349025, forks: 43697, open_issues: 32, age_days: 3258, has_coc: true, has_contributing: true, has_workflows: true, has_readme: true, description: "Interactive roadmaps, guides and other educational content to help developers grow in their careers." },
  { repo_name: "coding-interview-university", organization: "jwasham", language: "", stars: 336976, forks: 81644, open_issues: 95, age_days: 3540, has_coc: false, has_contributing: false, has_workflows: true, has_readme: true, description: "A complete computer science study plan to become a software engineer." },
  { repo_name: "system-design-primer", organization: "donnemartin", language: "Python", stars: 335320, forks: 54413, open_issues: 524, age_days: 3275, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "Learn how to design large-scale systems. Prep for the system design interview. Includes Anki flashcards." },
  { repo_name: "awesome-python", organization: "vinta", language: "Python", stars: 282802, forks: 27205, open_issues: 17, age_days: 4249, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "An opinionated list of awesome Python frameworks, libraries, software and resources." },
  { repo_name: "react", organization: "facebook", language: "JavaScript", stars: 242990, forks: 50574, open_issues: 1115, age_days: 4649, has_coc: true, has_contributing: true, has_workflows: true, has_readme: true, description: "The library for web and native user interfaces." },
  { repo_name: "linux", organization: "torvalds", language: "C", stars: 217354, forks: 60435, open_issues: 3, age_days: 5276, has_coc: false, has_contributing: false, has_workflows: false, has_readme: true, description: "Linux kernel source tree" },
  { repo_name: "vue", organization: "vuejs", language: "TypeScript", stars: 209882, forks: 33880, open_issues: 622, age_days: 4583, has_coc: false, has_contributing: false, has_workflows: true, has_readme: true, description: "This is the repo for Vue 2. For Vue 3, go to https://github.com/vuejs/core" },
  { repo_name: "tensorflow", organization: "tensorflow", language: "C++", stars: 193706, forks: 75228, open_issues: 3550, age_days: 3752, has_coc: true, has_contributing: true, has_workflows: true, has_readme: true, description: "An Open Source Machine Learning Framework for Everyone" },
  { repo_name: "vscode", organization: "microsoft", language: "TypeScript", stars: 181684, forks: 37936, open_issues: 13869, age_days: 3816, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "Visual Studio Code" },
  { repo_name: "flutter", organization: "flutter", language: "Dart", stars: 175189, forks: 29981, open_issues: 12448, age_days: 3997, has_coc: true, has_contributing: true, has_workflows: true, has_readme: true, description: "Flutter makes it easy and fast to build beautiful apps for mobile and beyond" },
  { repo_name: "bootstrap", organization: "twbs", language: "MDX", stars: 173966, forks: 79114, open_issues: 577, age_days: 5313, has_coc: true, has_contributing: false, has_workflows: true, has_readme: true, description: "The most popular HTML, CSS, and JavaScript framework for developing responsive, mobile first projects on the web." },
  { repo_name: "go", organization: "golang", language: "Go", stars: 132468, forks: 18820, open_issues: 9839, age_days: 4197, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "The Go programming language" },
  { repo_name: "kubernetes", organization: "kubernetes", language: "Go", stars: 120491, forks: 42460, open_issues: 2634, age_days: 4270, has_coc: false, has_contributing: true, has_workflows: true, has_readme: true, description: "Production-Grade Container Scheduling and Management" },
];
