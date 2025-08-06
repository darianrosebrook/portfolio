# Portfolio & Design System Playground

> **Professional portfolio showcasing advanced design system architecture, custom tooling development, and modern web technologies.**

This repository demonstrates sophisticated full-stack development capabilities, focusing on design systems, accessibility-first development, and complex mathematical implementations for typography analysis.

## 🏗️ **Technical Highlights**

### **Advanced Typography Analysis Engine**

- **Custom font anatomy detection** using geometric algorithms and Bézier curve analysis
- **Real-time glyph feature extraction** with fontkit and Canvas API integration
- **Mathematical precision** in serif detection, bowl analysis, and typography feature mapping
- **Performance-optimized** rendering with GSAP and requestAnimationFrame

### **Design System Architecture**

- **Comprehensive token system** with semantic color management and accessibility-first design
- **Scalable component patterns** using compound components and forwardRef patterns
- **Cross-platform considerations** for Web, iOS, and Android implementation
- **Advanced reduced motion context** with user preference persistence

### **Production-Ready Infrastructure**

- **Type-safe environment validation** with Zod schema parsing
- **Database optimization** featuring image deduplication with SHA-256 hashing
- **Performance monitoring** with Vercel Analytics and Core Web Vitals tracking
- **Accessibility compliance** with ARIA implementation and focus management

## 🛠️ **Tech Stack**

**Core Framework:** Next.js 15 (App Router) with TypeScript strict mode  
**Database:** Supabase with Row Level Security (RLS)  
**Styling:** SCSS with CSS Custom Properties and design tokens  
**Animation:** GSAP with reduced motion support  
**Editor:** Tiptap with custom extensions for rich content  
**Authentication:** Supabase Auth with middleware integration  
**Deployment:** Vercel with optimized build pipeline

## 🔬 **Advanced Features**

### **Typography Tools**

- **Glyph anatomy visualization** with interactive controls
- **Variable font axis manipulation** with real-time preview
- **Mathematical feature detection** (apex, arm, bowl, serif analysis)
- **Custom geometric algorithms** for typographic measurements

### **Performance Optimizations**

- **Font optimization** with Next.js localFont and strategic preloading
- **Image deduplication** system with reference counting
- **Component-level code splitting** for optimal bundle sizes
- **Memory-efficient** Canvas operations with proper cleanup

### **Accessibility Implementation**

- **Comprehensive ARIA support** with semantic markup
- **Focus management** with keyboard navigation
- **Reduced motion context** respecting user preferences
- **Color contrast** validation and semantic color tokens

## 🚀 **Quick Start**

```bash
# Clone and install
git clone https://github.com/darianrosebrook/portfolio.git
cd portfolio
npm install

# Set up environment (see .env.example)
cp .env.example .env.local
# Add your Supabase credentials

# Development server
npm run dev
```

## 📖 **Documentation**

This portfolio includes extensive documentation for design system fundamentals:

- **[Design Foundations](https://darianrosebrook.com/blueprints/foundations)** - Comprehensive design token architecture
- **[Accessibility Standards](https://darianrosebrook.com/blueprints/foundations/accessibility)** - WCAG compliance and inclusive design
- **[Component Standards](https://darianrosebrook.com/blueprints/component-standards)** - Scalable component patterns
- **[Typography Analysis](https://darianrosebrook.com/blueprints/foundations/typography)** - Advanced font feature detection

## 🎯 **Professional Context**

This codebase represents production-quality work with:

- **Enterprise-grade** type safety and error handling
- **Scalable architecture** supporting design system maintenance
- **Cross-functional** integration of design and development workflows
- **Performance-first** development with measurable optimizations

Built by [Darian Rosebrook](https://darianrosebrook.com), Staff Design Technologist specializing in design systems, accessibility, and developer tooling.

---

## 📦 **Project Structure**

```
portfolio/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── utils/              # Utilities and business logic
├── types/              # TypeScript type definitions
├── context/            # React Context providers
└── public/             # Static assets and fonts
```

**Live Site:** [https://darianrosebrook.com](https://darianrosebrook.com)

---

_This repository serves as both a professional portfolio and a learning resource for advanced design system development, mathematical typography analysis, and accessibility-first web development._
