'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
    setMobileOpen(false)
  }

  const isActive = (path: string) =>
    pathname === path ? 'bg-white/20' : 'hover:bg-white/20'

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <i className="fas fa-tshirt text-2xl"></i>
            <span className="text-xl font-bold">StyleHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className={`px-4 py-2 rounded-lg transition ${isActive('/')}`}>
              <i className="fas fa-home mr-2"></i>Home
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`px-4 py-2 rounded-lg transition relative ${isActive('/cart')}`}
            >
              <i className="fas fa-shopping-cart mr-2"></i>Cart
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  href="/orders"
                  className={`px-4 py-2 rounded-lg transition ${isActive('/orders')}`}
                >
                  <i className="fas fa-box mr-2"></i>Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/orders"
                    className={`px-4 py-2 rounded-lg transition ${isActive('/admin/orders')}`}
                  >
                    <i className="fas fa-shield-alt mr-2"></i>Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/30">
                  <span className="text-sm opacity-80">
                    <i className="fas fa-user-circle mr-1"></i>
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/auth/login"
                  className={`px-4 py-2 rounded-lg transition ${isActive('/auth/login')}`}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  <i className="fas fa-user-plus mr-2"></i>Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart badge + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" className="relative">
              <i className="fas fa-shopping-cart text-xl"></i>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-2xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-purple-700 px-4 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2 rounded hover:bg-white/20"
          >
            <i className="fas fa-home mr-2"></i>Home
          </Link>
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-4 py-2 rounded hover:bg-white/20"
          >
            <span><i className="fas fa-shopping-cart mr-2"></i>Cart</span>
            {totalItems > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded hover:bg-white/20"
              >
                <i className="fas fa-box mr-2"></i>My Orders
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded hover:bg-white/20"
                >
                  <i className="fas fa-shield-alt mr-2"></i>Admin Panel
                </Link>
              )}
              <div className="px-4 py-2 text-sm opacity-80">
                <i className="fas fa-user-circle mr-1"></i>{user.name}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 rounded hover:bg-white/20"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded hover:bg-white/20"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded hover:bg-white/20"
              >
                <i className="fas fa-user-plus mr-2"></i>Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
