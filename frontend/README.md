# AI Travel Planner Frontend

## Project Description

An AI-powered travel planning application built with React, TypeScript, and Vite. This frontend provides a beautiful, intuitive interface for users to plan their perfect trips with the help of artificial intelligence.

## Features

- 🌍 AI-powered travel planning
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🔄 Real-time API integration
- 📊 Query history and management
- 💾 Export and share travel plans

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd AI_Trip_Planner/frontend

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

Your application will be available at `http://localhost:8081`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   └── assets/        # Static assets
├── public/            # Public assets
└── package.json       # Dependencies and scripts
```

## Technologies Used

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Context API
- **HTTP Client**: Fetch API with custom service layer
- **Code Quality**: ESLint + TypeScript

## Backend Integration

This frontend connects to a FastAPI backend running on `http://localhost:8000`. Make sure the backend server is running for full functionality.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
