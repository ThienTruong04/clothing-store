import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/:id - Get a single product (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/:id - Update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(image !== undefined && { image }),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/:id - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = getTokenFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (payload.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    // Nullify productId in order items before deleting (preserve order history)
    await prisma.orderItem.updateMany({
      where: { productId: params.id },
      data: { productId: null },
    })
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
