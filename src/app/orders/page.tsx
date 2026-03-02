'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  productName: string
  productPrice: number
  quantity: number
}

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  recipientName: string
  phone: string
  address: string
  city: string
  note?: string | null
  items: OrderItem[]
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) {
      fetch('/api/orders')
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false))
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-3xl text-purple-600"></i>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-box mr-3 text-purple-600"></i>My Orders
          </h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
            <i className="fas fa-arrow-left mr-2"></i>Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4 block"></i>
            <h2 className="text-xl font-bold text-gray-600 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              <i className="fas fa-shopping-bag mr-2"></i>Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-800">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-sm font-bold text-purple-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-medium text-gray-800">{order.items.length}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusColor[order.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.status}
                    </span>
                    <i
                      className={`fas fa-chevron-${expanded === order.id ? 'up' : 'down'} text-gray-400`}
                    ></i>
                  </div>
                </div>

                {/* Order Items */}
                {expanded === order.id && (
                  <div className="border-t bg-gray-50 p-5">
                    {/* Shipping Address */}
                    {order.address && (
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                          <i className="fas fa-map-marker-alt mr-2 text-purple-500"></i>Địa chỉ giao hàng
                        </h3>
                        <p className="text-sm font-medium text-gray-800">{order.recipientName}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                        <p className="text-sm text-gray-600">{order.address}, {order.city}</p>
                        {order.note && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            <i className="fas fa-sticky-note mr-1"></i>{order.note}
                          </p>
                        )}
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">Sản phẩm đã đặt</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <span className="font-medium text-gray-800">{item.productName}</span>
                            <span className="text-gray-500 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-700">
                            ${(item.productPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-purple-600">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
