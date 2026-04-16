# HeritageKart 🏺

A premium e-commerce platform for historical and cultural artifacts, built with modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-V4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

## ✨ Features

### Customer Features
- 🔐 **Authentication** - Secure login/registration with Supabase Auth
- 📦 **Product Catalog** - Browse artifacts with search, filters & sorting
- 🛒 **Shopping Cart** - Add items, update quantities, persistent cart
- 💳 **Checkout** - Multi-step checkout with shipping address
- 📋 **Order Tracking** - View order history with status timeline

### Admin Dashboard
- 📊 **Analytics** - Revenue, orders, products, and user statistics
- 📦 **Product Management** - Full CRUD operations for artifacts
- 📋 **Order Management** - View and update order statuses
- 👥 **User Management** - Manage users and toggle admin roles

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 15, React 18, TypeScript |
| Styling | Tailwind CSS V4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | Zustand (with persistence) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Icons | Lucide React |

## 📁 Project Structure

```
heritagekart/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/              # User login
│   │   ├── register/           # User registration
│   │   ├── artifacts/          # Product catalog
│   │   ├── checkout/           # Checkout flow
│   │   ├── orders/             # Order history
│   │   └── admin/              # Admin dashboard
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Header, Footer
│   │   └── artifacts/          # Product cards
│   ├── lib/
│   │   ├── supabase/           # Supabase client utilities
│   │   ├── store.ts            # Zustand stores
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript interfaces
├── supabase/
│   └── schema.sql              # Database schema
└── .env.local                  # Environment variables
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Parzival048/mayurproj.git
   cd mayurproj/heritagekart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   - Go to your Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL editor

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The platform uses the following database tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with roles (customer/admin) |
| `categories` | Product categories |
| `artifacts` | Product listings with images and details |
| `cart_items` | User shopping carts |
| `orders` | Order records |
| `order_items` | Order line items |

All tables include Row Level Security (RLS) policies for data protection.

## 🎨 UI Components

Premium reusable components including:
- **Button** - Multiple variants, sizes, loading states
- **Input/Textarea/Select** - Form elements with validation
- **Card** - Hover effects and glassmorphism
- **Modal** - Animated overlays
- **Badge** - Status indicators
- **Skeleton** - Loading placeholders

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, features, products |
| `/login` | User login |
| `/register` | User registration |
| `/artifacts` | Product catalog with filters |
| `/artifacts/[slug]` | Product detail page |
| `/checkout` | Multi-step checkout |
| `/orders` | User order history |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/users` | User management |

## 🔒 Security

- Supabase Auth for authentication
- Row Level Security (RLS) on all tables
- Role-based access control
- Protected admin routes via middleware

## 📄 License

This project is private and confidential.

---

Built with ❤️ by [Parzival048](https://github.com/Parzival048)
