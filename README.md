# 🎓 Thilak Sir Academy - Educational Platform

A modern, secure educational platform built with React, TypeScript, and Vite. Features comprehensive course management, video streaming, admin controls, and mobile-first design.

## ✨ Features

### 🔐 **Security & Authentication**
- Supabase authentication with OTP email verification
- Row Level Security (RLS) policies for data protection
- Admin role-based access control
- Secure environment variable handling
- Input validation and sanitization

### 📚 **Course Management**
- Interactive course catalog with enrollment system
- Video streaming with preview/full access controls
- Freemium model (preview videos vs full course access)
- Mobile-optimized course detail pages

### 👨‍💼 **Admin Panel**
- Comprehensive enrollment management system
- Two-tier admin interface (overview + individual course management)
- Bulk operations for enrollment status updates
- Real-time notifications for pending enrollments
- Individual and bulk enrollment status management

### 📱 **User Experience**
- Mobile-first responsive design
- Progressive web app capabilities
- Real-time updates with React Query
- Toast notifications for user feedback
- Intuitive navigation with breadcrumbs

## 🛠 **Technology Stack**

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **React Query (TanStack)** - Server state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time subscriptions** - Live data updates

### Development Tools

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd thilak-academy-web-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Database Setup:**
   ```bash
   # Run in your Supabase SQL editor
   \i CRITICAL_SECURITY_POLICIES.sql
   ```

5. **Set First Admin User:**
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@domain.com';
   ```

6. **Start Development Server:**
   ```bash
   npm run dev
   ```

### Build for Production
```bash
npm run build
```

## 📋 **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Layout)
│   ├── ui/             # Basic UI components (Button, Card, etc.)
│   ├── AdminProtectedRoute.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication logic
│   ├── useAdmin.ts     # Admin functionality
│   └── useCourses.ts   # Course and enrollment management
├── lib/                # Utilities and configuration
│   ├── supabase.ts     # Supabase client setup
│   ├── validation.ts   # Security validation utilities
│   └── utils.ts        # General utilities
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CourseDetailPage.tsx
│   ├── VideoPage.tsx
│   ├── AdminEnrollmentsOverviewPage.tsx
│   └── AdminCourseEnrollmentsPage.tsx
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🔐 **Security**

This application implements enterprise-grade security:
- **Authentication**: Supabase Auth with OTP verification
- **Authorization**: Role-based access control (Admin/User)
- **Database Security**: Row Level Security (RLS) policies
- **Input Validation**: Client and server-side validation
- **Route Protection**: Protected routes for authenticated users
- **Admin Protection**: Additional protection for admin routes

See `PRODUCTION_SECURITY_CHECKLIST.md` for complete security guidelines.

## 🚀 **Deployment**

Follow the comprehensive `PRODUCTION_DEPLOYMENT_GUIDE.md` for:
- Production environment setup
- Security configuration
- Database policy implementation
- Performance optimization
- Monitoring and maintenance

## 📖 **Development**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name

# Create pull request for review
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run security checks
6. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Documentation**: Check the deployment and security guides
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Security**: Report security issues privately to maintainers
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
