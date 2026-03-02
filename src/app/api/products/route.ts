import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - List all products (public)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, description, price, image } = body

    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
