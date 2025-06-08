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
   - Visit the [Issues tab](https://github.com/your-username/heir-aid/issues) on GitHub.  
   - Choose an open issue that matches your skills (e.g., data extraction, frontend design) or create a new one if needed.  
   - Assign yourself to the issue or comment to claim it.

2. **Solve the Issue**:  
   - Create a feature branch from `develop`:  
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/your-issue-name
