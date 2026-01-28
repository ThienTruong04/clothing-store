# Clothing E-Commerce Platform

A full-stack e-commerce web application for selling clothing products, built with Next.js 14, TypeScript, PostgreSQL, and Prisma ORM.

## Features

✅ **Full CRUD Operations**

- Create, Read, Update, and Delete products
- RESTful API endpoints

✅ **Product Management**

- Product listing with grid layout
- Detailed product view
- Product creation and editing forms
- Image support (URL-based)

✅ **Database**

- PostgreSQL database
- Prisma ORM for type-safe queries
- Product schema with name, description, price, and image

✅ **Modern UI**

- Responsive design with Tailwind CSS
- Clean and intuitive interface
- Navigation menu
- Form validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd prn232
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
```

For cloud databases (recommended for deployment):

- **Neon**: https://neon.tech (Free PostgreSQL)
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com

4. Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. (Optional) Seed the database with sample data:

```bash
npx prisma db seed
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Example Request

**Create a product:**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic T-Shirt",
    "description": "Comfortable cotton t-shirt",
    "price": 29.99,
    "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
  }'
```

## Project Structure

```
prn232/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── products/      # API routes
│   │   ├── products/          # Product pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   └── lib/
│       └── prisma.ts          # Prisma client
├── .env                       # Environment variables
├── package.json
└── README.md
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string

4. Deploy!

### Database Setup for Production

Use a cloud PostgreSQL provider:

**Neon (Recommended - Free tier):**

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables

**Vercel Postgres:**

1. Go to your Vercel project
2. Navigate to Storage → Create Database
3. Select Postgres
4. Connection string is automatically added

## Usage

1. **View Products**: Homepage displays all products in a grid
2. **Add Product**: Click "Add New Product" button
3. **View Details**: Click on any product card
4. **Edit Product**: Click "Edit Product" on product detail page
5. **Delete Product**: Click "Delete Product" on product detail page

## Optional Features (Bonus)

To add bonus features:

- **Image Upload**: Integrate Cloudinary or AWS S3
- **Search/Filter**: Add search bar and filter options
- **Pagination**: Implement pagination for product lists
- **Authentication**: Add user authentication with NextAuth.js
- **Shopping Cart**: Add cart functionality
- **Checkout**: Integrate Stripe for payments

## Database Schema

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  image       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (Database GUI)
- `npx prisma migrate dev` - Create new migration

## Troubleshooting

**Database connection error:**

- Verify your DATABASE_URL is correct
- Ensure PostgreSQL is running (local) or accessible (cloud)
- Run `npx prisma generate` after changing schema

**Build errors:**

- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Clear cache: `npm run build`

**API errors:**

- Check browser console and terminal for error messages
- Verify Prisma client is generated: `npx prisma generate`

## License

MIT

## Student Info

- **Student ID**: QE123456 (Replace with your ID)
- **Course**: PRN232
- **Assignment**: Assignment 1

## Links

- **GitHub Repository**: [Add your repo URL]
- **Live Demo**: [Add your Vercel URL]

---

Built with ❤️ using Next.js and TypeScript
