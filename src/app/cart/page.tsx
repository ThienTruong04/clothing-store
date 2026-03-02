'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4 block"></i>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <i className="fas fa-arrow-left mr-2"></i>Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-shopping-cart mr-3 text-purple-600"></i>
            Your Cart
            <span className="ml-3 text-lg font-normal text-gray-500">({totalItems} items)</span>
          </h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
            <i className="fas fa-arrow-left mr-2"></i>Continue Shopping
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                <img
                  src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={item.productName}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80x80?text=No+Image'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                  <p className="text-purple-600 font-bold mt-1">${item.productPrice.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-red-400 hover:text-red-600 transition"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ${(item.productPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {user ? (
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
              >
                <i className="fas fa-lock mr-2"></i>Proceed to Checkout
              </button>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3 text-center">
                  Please login to checkout
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>Login to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
