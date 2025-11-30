# Reseller Catalog App

A React + Supabase application that enables resellers to create shareable product catalogs with cart-based checkout, multiple payment options, and built-in analytics tracking.

## Features

- **Product Management**: Add products with photos, names, prices, descriptions, and stock tracking
- **Category Organization**: Organize products into categories
- **Shareable Store Links**: Each reseller gets a unique URL (e.g., `/store/my-store-name`)
- **Shopping Cart & Checkout**: Customers can add items to cart and submit orders
- **Multiple Payment Options**: Support for Zelle, Venmo, PayPal, Cash App, and bank transfers
- **Order Management**: Track orders, update statuses, view customer details
- **Analytics Dashboard**: Track sales, revenue, top products, and customer data

## Tech Stack

- React 18 + Vite
- Supabase (Auth, PostgreSQL, Storage)
- TailwindCSS v4
- React Router
- Zustand (cart state)
- Recharts (analytics charts)

## Setup

### 1. Clone and Install

```bash
cd Catalog
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Set up Storage:
   - Create a bucket called `product-images`
   - Make it public
4. Copy your project URL and anon key from Project Settings > API

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the App

```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Login, Signup, ProtectedRoute
│   ├── dashboard/      # Sidebar, StatsCard, Layout
│   ├── products/       # ProductCard, ProductForm, ImageUpload
│   ├── categories/     # CategoryList
│   ├── orders/         # OrderList, OrderDetail
│   ├── storefront/     # Public store components
│   ├── analytics/      # Charts and tables
│   ├── settings/       # Store settings, payment methods
│   └── ui/             # Button, Input, Modal, etc.
├── pages/              # Page components
│   ├── auth/           # Login, Signup pages
│   ├── dashboard/      # Dashboard pages
│   └── storefront/     # Public store pages
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── lib/                # Utilities and Supabase client
└── App.jsx             # Main app with routing
```

## Routes

### Dashboard (Protected)
- `/dashboard` - Overview with stats
- `/dashboard/products` - Manage products
- `/dashboard/categories` - Manage categories
- `/dashboard/orders` - View and manage orders
- `/dashboard/analytics` - Sales analytics
- `/dashboard/settings` - Store settings & payment methods

### Public Storefront
- `/store/:slug` - Public store page
- `/store/:slug/checkout` - Checkout page

## Database Tables

- `resellers` - Store owner profiles
- `products` - Product catalog
- `categories` - Product categories
- `payment_methods` - Payment options (Zelle, Venmo, etc.)
- `orders` - Customer orders
- `order_items` - Order line items

## License

MIT
