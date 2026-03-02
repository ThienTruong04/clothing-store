import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = getTokenFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/:id - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = getTokenFromRequest(request)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { status } = await request.json()
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true },
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
