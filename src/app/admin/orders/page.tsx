'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  user: { id: string; name: string; email: string }
}

const STATUS_OPTIONS = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled']

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/admin/orders')
        return
      }
      if (!isAdmin) {
        router.push('/')
        return
      }
      fetchOrders()
    }
  }, [user, isAdmin, authLoading, router])

  const fetchOrders = () => {
    setLoading(true)
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch =
      search === '' ||
      o.id.includes(search) ||
      o.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const countByStatus = (s: string) => orders.filter((o) => o.status === s).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-3xl text-purple-600"></i>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <i className="fas fa-clipboard-list mr-3 text-purple-600"></i>Quản lý đơn hàng
            </h1>
            <p className="text-gray-500 mt-1">Tổng cộng {orders.length} đơn hàng</p>
          </div>
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
            <i className="fas fa-arrow-left mr-2"></i>Về trang chủ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`p-3 rounded-xl border-2 text-center transition ${
                filterStatus === s ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <p className={`text-lg font-bold ${filterStatus === s ? 'text-purple-600' : 'text-gray-700'}`}>
                {countByStatus(s)}
              </p>
              <p className={`text-xs capitalize ${filterStatus === s ? 'text-purple-500' : 'text-gray-500'}`}>
                {s}
              </p>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm theo tên, email, mã đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <i className="fas fa-sync-alt mr-2"></i>Làm mới
          </button>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                    <p className="font-mono text-xs font-medium text-gray-700 truncate max-w-[120px]">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                    <p className="text-sm font-medium text-gray-800">{order.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ngày đặt</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                    <p className="text-sm font-bold text-purple-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Status Dropdown */}
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-transparent focus:outline-none focus:border-purple-400 cursor-pointer capitalize ${
                        statusColor[order.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-800 capitalize">{s}</option>
                      ))}
                    </select>
                    {updating === order.id && (
                      <i className="fas fa-spinner fa-spin text-purple-500 text-sm"></i>
                    )}
                    <i
                      className={`fas fa-chevron-${expanded === order.id ? 'up' : 'down'} text-gray-400`}
                    ></i>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded === order.id && (
                  <div className="border-t bg-gray-50 p-5 grid md:grid-cols-2 gap-5">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                        <i className="fas fa-map-marker-alt mr-2 text-purple-500"></i>Địa chỉ giao hàng
                      </h3>
                      <p className="text-sm font-medium text-gray-800">{order.recipientName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <i className="fas fa-phone mr-2 text-gray-400 text-xs"></i>{order.phone}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <i className="fas fa-home mr-2 text-gray-400 text-xs"></i>{order.address}, {order.city}
                      </p>
                      {order.note && (
                        <p className="text-xs text-gray-500 mt-2 italic bg-yellow-50 p-2 rounded">
                          <i className="fas fa-sticky-note mr-1"></i>{order.note}
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                        <i className="fas fa-box mr-2 text-purple-500"></i>Sản phẩm ({order.items.length})
                      </h3>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium text-gray-800">{item.productName}</span>
                              <span className="text-gray-400 ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-gray-700">
                              ${(item.productPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800 text-sm">
                        <span>Tổng cộng</span>
                        <span className="text-purple-600">${order.totalAmount.toFixed(2)}</span>
                      </div>
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
