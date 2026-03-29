RepoExplorer is a responsive, interactive dashboard designed to help developers explore, search, and analyze the top 1000 most-starred public repositories on GitHub. 

## 📊 Data Source & Automation

This project's UI was initially designed around the excellent Kaggle dataset, [The Top-1000 GitHub Repositories](https://www.kaggle.com/datasets/felkan228/metadata-of-the-top-1000-github-repositories), which provides structured information on the 1000 most‑starred public repositories on GitHub.

To keep the data fresh and relevant, the project has since evolved into an automated system. We now use **GitHub Actions** to run a new query every week, automatically fetching the latest top-starred repositories and updating the underlying dataset. This ensures the dashboard always reflects the current state of the open-source ecosystem.

## ✨ Features

* **Rich Data Display:** View comprehensive details for each repository, including language, star count, forks, open issues, age, license, topics/tags, and workflow status.
* **Quick Look Panel:** Click on any repository to slide out a detailed side panel with extended metadata, project velocity metrics, and direct links to the repository and homepage.
* **Flexible Layouts:** Toggle seamlessly between a dense, data-rich **List View** and a highly visual **Grid View** (Cards).
* **Advanced Searching:** Instantly filter repositories by name, description, or language. You can even use specific prefixes like `lang:rust` or `python`.
* **Dynamic Sorting:** Sort the top 1000 repositories by Stars, Forks, Open Issues, or Age.
* **Fully Responsive:** Carefully crafted with Tailwind CSS to provide a perfect viewing experience on mobile, tablet, and ultra-wide desktop displays.

## 🛠️ Tech Stack

* **Frontend Framework:** React 18 with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Data Parsing:** PapaParse (for client-side CSV processing)
* **Automation:** GitHub Actions (Weekly Cron Job)

## 🚀 Running Locally

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/joshchamo/repo-explorer.git
   cd repo-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port provided by Vite).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/repo-explorer/issues) if you want to contribute.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
