# Project Folder Structure

```
/workspaces/heiraid
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
│
├── frontend/                    # Next.js app
│   ├── public/                  # Static assets
│   ├── pages/                   # App routes
│   ├── components/              # UI components
│   ├── lib/                     # Utilities (API, formatting)
│   ├── styles/                  # Tailwind or CSS modules
│   ├── prompts/                 # GPT prompt templates (if client-side)
│   └── .env.local               # Local frontend env
│
├── backend/                     # FastAPI or Flask app
│   ├── main.py                  # Entry point
│   ├── routes/                  # API endpoints
│   ├── services/                # Form recognizer, AI search, etc.
│   ├── rag/                     # RAG/embedding logic
│   ├── search/                  # Cognitive search setup
│   ├── data/                    # Sample & parsed legal documents
│   ├── utils/                   # Helper functions
│   └── .env.local               # Local backend env
│
├── infra/                       # Azure infrastructure code
│   ├── bicep/                   
│   └── terraform/               
│
├── scripts/                     # Setup or admin scripts
│
├── README.md
├── requirements.txt             # Backend dependencies
├── package.json                 # Frontend dependencies
└── azure.yaml                   # Azure deployment config (if needed)

```

## Folder Descriptions

- **backend/**: Contains all backend code and APIs.
  - **api/**: API endpoints and related logic.
    - **start**: (File or entry point for backend API)
- **frontend/**: Contains all frontend code (UI, static assets, etc).
  - **package.json**: Frontend dependencies and scripts.
- **LICENSE**: Project license (MIT).
- **README.md**: Project documentation.

> Add more folders as needed (e.g., `data/`, `scripts/`, `docs/`).
