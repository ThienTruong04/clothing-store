import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders - Get all orders (admin) or current user's orders
export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    if (payload.role === 'admin') {
      // Admin: get all orders with user info
      const orders = await prisma.order.findMany({
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    }

    // Regular user: only their own orders
    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders - Create an order from cart items
export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { items, recipientName, phone, address, city, note } = await request.json()
    // items: Array<{ productId, productName, productPrice, quantity }>

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!recipientName || !phone || !address || !city) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (sum: number, item: { productPrice: number; quantity: number }) =>
        sum + item.productPrice * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        totalAmount,
        status: 'pending',
        recipientName,
        phone,
        address,
        city,
        note: note || null,
        items: {
          create: items.map((item: {
            productId: string
            productName: string
            productPrice: number
            quantity: number
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
