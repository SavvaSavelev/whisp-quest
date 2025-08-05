# ✨ Whisp Quest

> **Enterprise-level Interactive Spirit Summoning Experience**

Whisp Quest is an innovative experimental platform where words have the power to summon digital spirits. Built with modern React, Three.js, and powered by OpenAI, this project demonstrates professional-grade architecture and development practices.

[![CI](https://github.com/SavvaSavelev/whisp-quest/workflows/🔄%20Continuous%20Integration/badge.svg)](https://github.com/SavvaSavelev/whisp-quest/actions)
[![Security](https://github.com/SavvaSavelev/whisp-quest/workflows/🔒%20Security%20Audit/badge.svg)](https://github.com/SavvaSavelev/whisp-quest/actions)
[![Deploy](https://github.com/SavvaSavelev/whisp-quest/workflows/🚀%20Deploy%20to%20Production/badge.svg)](https://github.com/SavvaSavelev/whisp-quest/actions)

## 🚀 Features

- **🧙‍♂️ AI-Powered Spirit Generation** - OpenAI analyzes text to create unique spirits
- **🎨 3D Interactive Experience** - Three.js rendering with immersive visuals  
- **💬 Dynamic Spirit Conversations** - Chat with your summoned spirits
- **📱 Responsive Design** - Works on desktop and mobile
- **🔒 Enterprise Security** - Professional security measures and auditing
- **⚡ High Performance** - Optimized rendering and caching

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Three.js + Tailwind CSS
- **Backend**: Express.js + OpenAI API + Rate Limiting + Security
- **Build**: Vite + ESBuild for fast development and production builds
- **Testing**: Jest + React Testing Library with 40%+ coverage
- **CI/CD**: GitHub Actions with automated testing, security scanning, and deployment

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### 🖥️ Backend Setup
```bash
cd whisp-server
npm install
echo "OPENAI_API_KEY=your_api_key_here" > .env
npm run dev  # or npm start for production
```

### 🌐 Frontend Setup  
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:server       # Start backend server

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues
npm run type-check      # TypeScript type checking

# Utilities
npm run audit           # Security audit
npm run clean           # Clean build artifacts
npm run prepare         # Pre-commit checks
```

### 🧪 Testing

```bash
npm run test:coverage
```

Our test suite includes:
- Unit tests for core functionality
- Integration tests for API endpoints  
- Coverage threshold: 40%+ (branches, functions, lines, statements)

### 🔧 VSCode Setup

This project includes professional VSCode configuration:

- **Extensions**: Auto-installed recommended extensions
- **Settings**: Optimized for TypeScript, React, and Tailwind
- **Tasks**: Pre-configured build, test, and dev tasks
- **Debugging**: Full-stack debugging configurations

## 🔒 Security

### Automated Security Features:
- **Dependency Scanning**: Weekly Snyk and npm audit
- **Code Analysis**: CodeQL static analysis  
- **Secret Detection**: TruffleHog integration
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation

### Manual Security Practices:
- Regular dependency updates via Dependabot
- Secure environment variable handling
- CORS and Helmet security headers
- No secrets in repository

## 🚀 Deployment

### GitHub Pages (Automatic)
Push to `master` triggers automatic deployment to GitHub Pages.

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Production Environment Variables
```bash
OPENAI_API_KEY=your_production_api_key
NODE_ENV=production
PORT=3001
```

## 📊 Performance

- **Bundle Size**: <1MB gzipped for core functionality
- **Load Time**: <3s on 3G connection
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Memory Usage**: Optimized Three.js rendering with cleanup

## 🤝 Contributing

We follow enterprise-level development practices:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** with conventional commits: `git commit -m "✨ Add amazing feature"`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards:
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Jest for testing with good coverage
- Conventional commits for clear history

## 📚 Documentation

- [CI/CD Pipeline](./docs/CI-CD.md) - Complete CI/CD documentation
- [Enterprise Improvements](./docs/ENTERPRISE_IMPROVEMENTS.md) - Technical improvements summary
- [API Documentation](./whisp-server/README.md) - Backend API reference

## 🔧 Technical Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and developer experience
- **Three.js** - 3D rendering and animations
- **@react-three/fiber** - React renderer for Three.js
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management

### Backend
- **Express.js** - Fast, minimalist web framework
- **OpenAI API** - GPT-powered spirit generation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### DevOps & Quality
- **Vite** - Next-generation build tool
- **Jest** - JavaScript testing framework
- **ESLint** - Code linting and formatting
- **GitHub Actions** - CI/CD automation
- **Dependabot** - Automated dependency updates

## 📈 Roadmap

- [ ] **E2E Testing** - Playwright integration
- [ ] **Storybook** - Component documentation
- [ ] **PWA Features** - Offline support
- [ ] **Performance Monitoring** - Real-time metrics
- [ ] **A/B Testing** - Feature experimentation
- [ ] **Internationalization** - Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **SavvaSavelev** - Project Lead & Full-Stack Developer

---

**Built with ❤️ using enterprise-level practices and modern web technologies.**
