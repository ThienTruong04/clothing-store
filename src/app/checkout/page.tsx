'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

interface ShippingForm {
  recipientName: string
  phone: string
  address: string
  city: string
  note: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingForm>({
    recipientName: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<ShippingForm>>({})

  const setField = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const errs: Partial<ShippingForm> = {}
    if (!shipping.recipientName.trim()) errs.recipientName = 'Vui lòng nhập tên người nhận'
    if (!shipping.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^[0-9]{9,11}$/.test(shipping.phone.replace(/\s/g, '')))
      errs.phone = 'Số điện thoại không hợp lệ'
    if (!shipping.address.trim()) errs.address = 'Vui lòng nhập địa chỉ'
    if (!shipping.city.trim()) errs.city = 'Vui lòng nhập thành phố / tỉnh'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-5xl text-gray-300 mb-4 block"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Please login to checkout</h2>
          <Link
            href="/auth/login"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-shopping-cart text-5xl text-gray-300 mb-4 block"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
          <Link href="/" className="text-purple-600 hover:underline">
            <i className="fas fa-arrow-left mr-2"></i>Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            productPrice: i.productPrice,
            quantity: i.quantity,
          })),
          recipientName: shipping.recipientName.trim(),
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
          city: shipping.city.trim(),
          note: shipping.note.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to place order')
      } else {
        clearCart()
        setSuccess(data.id)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check-circle text-4xl text-green-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-1">Cảm ơn bạn đã mua hàng.</p>
          <p className="text-sm text-gray-600 mb-1">
            Giao đến: <span className="font-medium">{shipping.address}, {shipping.city}</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">Mã đơn: {success}</p>
          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              <i className="fas fa-list mr-2"></i>Xem đơn hàng của tôi
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              <i className="fas fa-shopping-bag mr-2"></i>Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/cart" className="text-purple-600 hover:text-purple-800 mr-4">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-credit-card mr-3 text-purple-600"></i>Checkout
          </h1>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left */}
          <div className="md:col-span-3 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">
                <i className="fas fa-user mr-2 text-purple-600"></i>Thông tin khách hàng
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                <div><span className="font-medium">Tên:</span> {user.name}</div>
                <div><span className="font-medium">Email:</span> {user.email}</div>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-5">
                <i className="fas fa-map-marker-alt mr-2 text-purple-600"></i>Địa chỉ giao hàng
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recipient Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.recipientName}
                      onChange={(e) => setField('recipientName', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${formErrors.recipientName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {formErrors.recipientName && <p className="text-red-500 text-xs mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{formErrors.recipientName}</p>}
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="0901234567"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${formErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{formErrors.phone}</p>}
                  </div>
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ (số nhà, đường, phường/xã, quận/huyện) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="123 Đường Lý Thường Kiệt, Phường 7, Quận 10"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${formErrors.address ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{formErrors.address}</p>}
                </div>
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thành phố / Tỉnh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="TP. Hồ Chí Minh"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{formErrors.city}</p>}
                </div>
                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú <span className="text-gray-400 text-xs">(tuỳ chọn)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={shipping.note}
                    onChange={(e) => setField('note', e.target.value)}
                    placeholder="Ghi chú cho người giao hàng (gọi trước khi giao, để cổng trước...)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">
                <i className="fas fa-truck mr-2 text-purple-600"></i>Phương thức giao hàng
              </h2>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                <div>
                  <p className="font-semibold text-green-800">Giao hàng tiêu chuẩn — Miễn phí</p>
                  <p className="text-sm text-green-600">Dự kiến 3–5 ngày làm việc</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">
                <i className="fas fa-lock mr-2 text-purple-600"></i>Thanh toán
              </h2>
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center text-gray-500">
                <i className="fas fa-money-bill-wave text-3xl text-purple-300 mb-2 block"></i>
                <p className="text-sm font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-xs text-gray-400 mt-1">Nhấn &quot;Đặt hàng&quot; để xác nhận</p>
              </div>
            </div>
          </div>

          {/* Right – Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <img
                      src={item.image || 'https://via.placeholder.com/48x48?text=No'}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-purple-600">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Live address preview */}
              {(shipping.recipientName || shipping.address) && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">
                    <i className="fas fa-map-marker-alt mr-1 text-purple-400"></i>Giao đến:
                  </p>
                  {shipping.recipientName && <p className="text-sm font-medium text-gray-800">{shipping.recipientName}</p>}
                  {shipping.phone && <p className="text-xs text-gray-500">{shipping.phone}</p>}
                  {shipping.address && (
                    <p className="text-xs text-gray-500">{shipping.address}{shipping.city ? `, ${shipping.city}` : ''}</p>
                  )}
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2 mt-2">
                  <span>Tổng cộng</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Đang đặt hàng...</>
                ) : (
                  <><i className="fas fa-check mr-2"></i>Đặt hàng — ${totalPrice.toFixed(2)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}