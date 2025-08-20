# Overview

SPMS (Student Performance Management System) is a comprehensive full-stack web application designed for programme leaders to manage and track student academic performance. The system provides a complete dashboard for monitoring student progress, CGPA trends, course management, and generating insightful reports. Built with modern web technologies, it features a React frontend with TypeScript, Express.js backend, and PostgreSQL database integration using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful API with structured error handling and request logging middleware
- **File Upload**: Multer middleware for handling CSV imports and file uploads
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Comprehensive relational design with tables for students, modules, results, CGPA records, academic alerts, and activity logs
- **Migrations**: Drizzle Kit for database schema versioning and migrations
- **Connection**: Connection pooling with @neondatabase/serverless for optimal performance

## Core Features Architecture
- **Dashboard Analytics**: Real-time metrics calculation with performance insights and predictive analytics
- **Student Management**: CRUD operations with advanced filtering, sorting, and bulk import capabilities
- **Course Management**: Module tracking with prerequisites, credit management, and programme-specific organization
- **Reporting System**: Comprehensive report generation with export functionality (PDF/CSV)
- **Performance Tracking**: CGPA trend analysis, grade distribution visualization, and at-risk student identification

## UI/UX Design System
- **Design Tokens**: CSS custom properties for consistent theming and color management
- **Component Library**: Comprehensive set of reusable UI components following accessibility standards
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes
- **Data Visualization**: Chart.js integration for interactive charts and performance analytics
- **Modern UX**: Skeleton loading states, toast notifications, and smooth transitions

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **WebSocket Support**: For real-time database connections via ws library

## Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form for form management
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side navigation
- **Charts**: Chart.js with react-chartjs-2 for data visualization
- **Validation**: Zod for runtime type validation and schema definition

## Backend Dependencies
- **Express.js**: Web application framework with middleware support
- **File Processing**: Multer for multipart form data and CSV parser for data imports
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Utilities**: date-fns for date manipulation, memoizee for function memoization

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: tsx for TypeScript execution, esbuild for production bundling
- **Replit Integration**: Custom plugins for development environment optimization
- **Code Quality**: TypeScript compiler with strict configuration for type safety