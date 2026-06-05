# RAG-Based Customer Insight Intelligence
## E-Commerce Product Launch Platform | MLOps Day 15 – Task 26

---

## 🚀 Project Overview

An AI-powered **RAG (Retrieval-Augmented Generation)** platform that transforms raw product inputs into comprehensive, market-ready **e-commerce launch assets** by leveraging real customer review intelligence.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (HTML + CSS + JS)   │  Nginx  :8080            │
│  - Product input form         │                          │
│  - RAG pipeline visualization │                          │
│  - Results dashboard (tabs)   │                          │
└──────────────────────┬────────┘                          │
                       │ /api/* proxy                      │
┌──────────────────────▼────────┐                          │
│  Flask Backend  :5000         │                          │
│  - RAG retrieval engine       │                          │
│  - Sentiment analysis         │                          │
│  - Content generation         │                          │
│  - Competitor intelligence    │                          │
└──────────────────────────────-┘
```

---

## 📁 Project Structure

```
TASK 26/
├── backend/
│   ├── app.py              # Flask API with RAG pipeline
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Main UI
│   ├── style.css           # Premium dark-mode styles
│   └── app.js              # Frontend logic & API calls
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Full-stack orchestration
├── nginx.conf              # Nginx proxy config
└── README.md               # This file
```

---

## 🔍 RAG Pipeline

1. **Input**: Product name, category, features, price range
2. **Retrieve**: Relevant customer reviews from knowledge base (by category)
3. **Analyze**: Sentiment analysis — positive/negative counts, pain points, strengths
4. **Generate**: All launch assets using retrieved insights

---

## 📦 Generated Launch Assets

| Asset | Description |
|-------|-------------|
| 🏷️ SEO Title | Keyword-optimized marketplace title |
| 📝 Product Description | Customer-insight driven copy |
| 🎬 Promotional Script | Video/ad script using real testimonials |
| 💰 Pricing Strategy | Budget / Standard / Premium tiers |
| 📦 Packaging Suggestions | Customer feedback-informed packaging |
| 🚀 Launch Card | Marketplace-ready summary with readiness score |

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/analyze` | Main RAG analysis |
| GET | `/api/categories` | List product categories |
| GET | `/api/reviews/<category>` | Get reviews for category |

### POST `/api/analyze` Request Body
```json
{
  "product_name": "SmartFit Pro Wireless Earbuds",
  "category": "electronics",
  "features": "Active noise cancellation, 30hr battery, IPX5",
  "price_range": "mid"
}
```

---

## 🐳 Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:8080
# Backend:  http://localhost:5000/api/health
```

---

## 💻 Running Locally (Without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend – open in browser
# Open frontend/index.html directly, or use Live Server
```

---

## 🎨 Tech Stack

- **Backend**: Python 3.11 + Flask + Flask-CORS
- **Frontend**: HTML5 + Vanilla CSS (glassmorphism) + Vanilla JS
- **Containerization**: Docker + Docker Compose + Nginx
- **AI Architecture**: RAG (Retrieval-Augmented Generation)
