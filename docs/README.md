# HeirAid

**HeirAid** is an AI-powered platform to help legal professionals, nonprofits, and communities resolve heirs’ property challenges. It leverages Microsoft Azure's AI, mapping, and document processing services to deliver scalable, trustworthy solutions.

## 🌟 Features

- AI-powered legal assistant (Azure OpenAI + Azure AI Search)
- Legal doc parser (Azure Form Recognizer)
- GIS-based risk mapping (Azure Maps + public data)
- RAG-powered policy summarizer
- Community outreach suggestions with privacy in mind

## 💻 Tech Stack

- Azure OpenAI
- Azure AI Search
- Azure Form Recognizer
- Azure Maps
- Azure Static Web Apps
- (Optional) Azure Cosmos DB

## 🚀 How to Run (Coming Soon)

## 📁 Project Structure

- `/data/`  
  - `/gpcsf/` - Georgia Probate Court Standard Forms PDFs and extracted text  
  - `/assessors/` - Fulton County Assessors PDFs and text  
  - `/fulton/` - Fulton Decedents' Estates text  
  - `/ocga/` - O.C.G.A. sections text  
  - `/tax_bill/` - Tax bill CSV/JSON data  
- `/src/`  
  - `/feature_a/` - AI Legal Assistant code  
  - `/feature_b/` - Neighborhood Risk Mapping code  
  - `/frontend/` - React frontend code  
- `/docs/`  
  - `meeting_notes.md` - Collaboration notes  
  - `readme.md` - Project overview  

## 🤝 Contribution Process

We welcome contributions to enhance HeirAid! Follow these steps to collaborate effectively:

1. **Pick an Issue**:  
   - Visit the [Issues tab](https://github.com/NoelOsiro/heiraid/issues) on GitHub.  
   - Choose an open issue that matches your skills (e.g., data extraction, frontend design) or create a new one if needed.  
   - Assign yourself to the issue or comment to claim it.

2. **Solve the Issue**:  
   - Create a feature branch from `develop`:  
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/your-issue-name
     ```
   - Implement your solution (e.g., update code, add data) in the relevant folder (e.g., `/src/feature_a/` or `/src/frontend/`).  
   - Test your changes locally to ensure they work as expected.

3. **Create a Pull Request (PR) to `develop`**:  
   - Commit and push your changes:  
     ```bash
     git add .
     git commit -m "Resolve #issue-number: Brief description"
     git push origin feature/your-issue-name
     ```
   - Open a PR on GitHub targeting the `develop` branch.  
   - Include a clear title (e.g., "Fix #5: Add ChatComponent") and description outlining your changes.

4. **Request Review**:  
   - Assign a reviewer (e.g., @li-username) in the PR.  
   - Respond to feedback and make necessary adjustments.  
   - Ensure at least one approval is received before proceeding.

5. **Merge to `develop`**:  
   - Once approved, merge the PR into `develop`:  
     ```bash
     git checkout develop
     git pull origin develop
     git merge --no-ff feature/your-issue-name
     git push origin develop
     ```
   - Delete the feature branch if no further work is needed.

6. **Merge to `main`**:  
   - After testing on `develop`, create a PR from `develop` to `main` for stable releases.  
   - Follow the same review process, then merge:  
     ```bash
     git checkout main
     git pull origin main
     git merge --no-ff develop
     git push origin main
     ```
   - Tag releases (e.g., `v1.0.0`) for milestone tracking.

### Best Practices
- Keep commits small and focused.
- Write clear, descriptive commit messages referencing issue numbers (e.g., `#5`).
- Use `develop` for active development and `main` for production-ready code.
- Document changes in `docs/meeting_notes.md` for team alignment.

## 📜 License

[MIT](./LICENSE)
