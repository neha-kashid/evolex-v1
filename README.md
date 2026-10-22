# EVOLEX AI — AI-Powered Content Intelligence for Creators

**EVOLEX AI** helps digital content creators make informed decisions throughout their content journey—from discovering opportunities and evaluating ideas to analyzing videos and learning from experiments.

Built for the **Google Cloud AI Builder Cup 2026**, EVOLEX combines Google's Gemini API with a creator-focused workflow to help creators move from guesswork to informed experimentation.

## ✨ Features

### 1. Opportunity Map
Discover personalized content opportunities aligned with creator interests, strengths, and goals.

### 2. Pre-Publish Lab
Evaluate content ideas before publishing. Gemini helps analyze hooks, clarity, structure, and audience fit, providing actionable suggestions for improvement.

### 3. Post-Publish Lab
Analyze uploaded videos across the beginning, middle, and ending to identify storytelling strengths and areas for improvement. Generate alternative hooks and recommendations for future content.

### 4. My Experiments
Track content experiments and hypotheses to support structured, data-driven content improvement.

### 5. Creator Profile & Intelligence
Explore content quality trends, content patterns, content mix, and Creator DNA signals to understand strengths and identify areas to focus on.

## 🛠️ Tech Stack

- **Frontend:** Next.js
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API
- **AI Model:** Google Gemini 3.8 Flash 
- **Deployment:** Google Cloud Run
- **Secret Management:** Google Cloud Secret Manager

Gemini requests are handled through server-side API routes. The deployed application uses Google Cloud Secret Manager to manage the API key.

## 🏗️ How It Works

1. Creators interact with the EVOLEX AI web application.
2. The Next.js application handles the interface and server-side API requests.
3. Relevant content and requests are processed using the Gemini API.
4. The application presents AI-generated analysis and recommendations through its creator-focused workflows.

## 🌐 Live Demo

**[Launch EVOLEX AI](https://evolex-ai-837859545416.asia-south1.run.app)**

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Google Gemini API key

### Installation

Clone the repository:

```bash
git clone https://github.com/neha-kashid/evolex-v1.git
cd evolex-v1
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root and add the environment variable expected by your application:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder with your own API key. Verify the environment variable name against your server-side code before running the application locally.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To build the application locally:

```bash
npm run build
```

## 🔮 Future Scope

Planned enhancements include:

- AI-powered generation of scripts, hooks, captions, and calls to action.
- Platform-specific content adaptation and multiple content variants.
- Beginner-friendly idea-to-content guidance, including scripts and storyboards.
- Deeper personalization informed by creator feedback and experiment outcomes.

These are future enhancements and are not all part of the current prototype.

## 🎯 Vision

EVOLEX AI aims to help creators discover opportunities, make smarter content decisions, understand their videos, and continuously improve through personalized AI insights.

---

**Project:** EVOLEX AI  
**Category:** AI-powered content intelligence  
**Built for:** Google Cloud AI Builder Cup 2026
