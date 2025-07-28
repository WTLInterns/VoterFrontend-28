# 🗳️ Voter Registration Management System

A comprehensive, multi-language voter registration management dashboard built with React, TypeScript, and Tailwind CSS. This system provides role-based access control for administrators and master administrators to manage voter registrations, election officers, and system analytics.

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Admin and Master Admin roles with different permissions
- **Secure Login System**: Protected routes with authentication middleware
- **Session Management**: Persistent login sessions with localStorage
- **Security Logging**: Track login attempts and system access

### 🌍 Multi-Language Support
- **3 Languages**: English, Hindi (हिंदी), and Marathi (मराठी)
- **Dynamic Language Switching**: Real-time language changes without page reload
- **Localized Content**: Complete translation of all UI elements
- **RTL Support Ready**: Architecture supports right-to-left languages

### 🎨 Theme System
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Persistent Preferences**: Theme selection saved across sessions
- **Consistent Styling**: All components support both themes
- **Accessibility**: High contrast ratios for better readability

### 📊 Admin Dashboard Features
- **Voter Management**: Register, view, and manage voter information
- **Election Officers**: Manage field officers and their activities
- **Location Tracking**: Real-time GPS tracking of officers
- **Data Management**: Import/export voter data and analytics
- **Statistics Cards**: Real-time metrics with trend indicators
- **Recent Activity**: Live feed of registration activities

### 👑 Master Admin Features
- **System Overview**: Complete system health and performance metrics
- **Administrator Management**: Create and manage admin accounts
- **Security Logs**: Monitor system access and security events
- **System Settings**: Configure system-wide parameters
- **Advanced Analytics**: Comprehensive reporting and insights

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Animated Sidebar**: Smooth navigation with mobile overlay
- **Touch-Friendly**: Optimized for touch interactions
- **Progressive Enhancement**: Works on all modern browsers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Demo Credentials

#### Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: Voter management, officer tracking, basic analytics

#### Master Admin Access
- **Username**: `master`
- **Password**: `master123`
- **Features**: Full system access, admin management, security logs

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Authentication components
│   ├── master/          # Master admin components
│   ├── maps/            # Map integration components
│   └── ui/              # Reusable UI components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── DataContext.tsx  # Application data
│   ├── LanguageContext.tsx # Internationalization
│   └── ThemeContext.tsx # Theme management
├── locales/             # Translation files
│   ├── en.ts           # English translations
│   ├── hi.ts           # Hindi translations
│   └── mr.ts           # Marathi translations
├── types/               # TypeScript type definitions
└── assets/              # Static assets
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Router DOM**: Client-side routing

### Development Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting and quality
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Environment Setup
The application uses localStorage for data persistence in demo mode. For production:

1. Replace mock data with real API endpoints
2. Configure authentication backend
3. Set up database connections
4. Configure map services (Google Maps API)

### Customization
- **Colors**: Modify `tailwind.config.js` for brand colors
- **Languages**: Add new translation files in `src/locales/`
- **Themes**: Extend theme system in `ThemeContext.tsx`

## 🌟 Key Features Explained

### Multi-Language System
The application uses a robust internationalization system:
- Context-based language management
- Dynamic content switching
- Persistent language preferences
- Easy addition of new languages

### Theme Management
Comprehensive dark/light mode support:
- System-wide theme consistency
- Smooth transitions between themes
- Persistent user preferences
- Accessibility-compliant color schemes

### Role-Based Access
Secure authentication system:
- Protected routes based on user roles
- Different dashboard layouts per role
- Granular permission control
- Session management with security logging

## 📊 Data Management

The system includes comprehensive data management:
- **Voter Records**: Complete voter information with status tracking
- **Officer Management**: Field officer assignments and tracking
- **Transaction History**: Payment and registration tracking
- **Analytics**: Real-time statistics and trend analysis
- **Location Data**: GPS tracking for field operations

## 🔒 Security Features

- **Authentication**: Secure login with role validation
- **Session Management**: Persistent sessions with security
- **Access Control**: Role-based route protection
- **Audit Logging**: Track all system access and changes
- **Data Validation**: Input sanitization and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo credentials above

---

**Built with ❤️ for democratic processes and efficient voter management.**