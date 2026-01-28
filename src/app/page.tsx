'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
  createdAt: string
  updatedAt?: string
}

const ITEMS_PER_PAGE = 8

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'admin'>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ id: '', name: '', description: '', price: '', image: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch products
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setAllProducts(data)
      applyFilters(data)
    } catch (error) {
      showToast('Failed to load products', 'error')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Apply filters and sorting
  const applyFilters = (products: Product[]) => {
    let filtered = [...products]

    // Search
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (priceFilter) {
      filtered = filtered.filter(p => {
        if (priceFilter === '0-50') return p.price < 50
        if (priceFilter === '50-100') return p.price >= 50 && p.price < 100
        if (priceFilter === '100-200') return p.price >= 100 && p.price < 200
        if (priceFilter === '200+') return p.price >= 200
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price
      if (sortOption === 'price-high') return b.price - a.price
      if (sortOption === 'name') return a.name.localeCompare(b.name)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    applyFilters(allProducts)
  }, [searchTerm, priceFilter, sortOption])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCreateClick = () => {
    setFormData({ id: '', name: '', description: '', price: '', image: '' })
    setShowProductModal(true)
  }

  const handleEditClick = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image || '',
    })
    setShowProductModal(true)
  }

  const handleDeleteClick = (product: Product) => {
    setDeleteProductId(product.id)
    setShowDeleteModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = formData.id ? 'PUT' : 'POST'
      const endpoint = formData.id ? `/api/products/${formData.id}` : '/api/products'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.image || null,
        }),
      })

      if (res.ok) {
        showToast(formData.id ? 'Product updated successfully!' : 'Product created successfully!')
        setShowProductModal(false)
        loadProducts()
      } else {
        showToast('Failed to save product', 'error')
      }
    } catch (error) {
      showToast('Error saving product', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteProductId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/products/${deleteProductId}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Product deleted successfully!')
        setShowDeleteModal(false)
        setDeleteProductId(null)
        loadProducts()
        setCurrentView('home')
      } else {
        showToast('Failed to delete product', 'error')
      }
    } catch (error) {
      showToast('Error deleting product', 'error')
    } finally {
      setLoading(false)
    }
  }

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
              <i className="fas fa-tshirt text-2xl mr-2"></i>
              <span className="text-xl font-bold">StyleHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => setCurrentView('home')} className="px-4 py-2 rounded-lg hover:bg-white/20 transition">
                <i className="fas fa-home mr-2"></i>Home
              </button>
              <button onClick={() => setCurrentView('admin')} className="px-4 py-2 rounded-lg hover:bg-white/20 transition">
                <i className="fas fa-cog mr-2"></i>Admin
              </button>
              <button onClick={handleCreateClick} className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                <i className="fas fa-plus mr-2"></i>Add Product
              </button>
            </div>
            <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-purple-700 px-4 pb-4">
            <button onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded hover:bg-white/20">
              <i className="fas fa-home mr-2"></i>Home
            </button>
            <button onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded hover:bg-white/20">
              <i className="fas fa-cog mr-2"></i>Admin
            </button>
            <button onClick={() => { handleCreateClick(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded hover:bg-white/20">
              <i className="fas fa-plus mr-2"></i>Add Product
            </button>
          </div>
        )}
      </nav>

      {/* Home Page */}
      {currentView === 'home' && (
        <div>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Style</h1>
              <p className="text-xl opacity-90 mb-8">Premium clothing for every occasion</p>
              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
                <i className="fas fa-search absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">Filter by:</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Prices</option>
                  <option value="0-50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200+">$200+</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto px-4 pb-12">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:-translate-y-1 transition transform"
                      onClick={() => {
                        setSelectedProduct(product)
                        setCurrentView('detail')
                      }}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image' }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-purple-600">${product.price.toFixed(2)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(product)
                            }}
                            className="text-gray-400 hover:text-purple-600 transition"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-100 border'
                      }`}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg border ${
                          page === currentPage ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-purple-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-purple-100 border'
                      }`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Page */}
      {currentView === 'detail' && selectedProduct && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button onClick={() => setCurrentView('home')} className="mb-6 text-purple-600 hover:text-purple-800 font-medium">
            <i className="fas fa-arrow-left mr-2"></i>Back to Products
          </button>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={selectedProduct.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                  alt={selectedProduct.name}
                  className="w-full h-96 md:h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image' }}
                />
              </div>
              <div className="md:w-1/2 p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedProduct.name}</h1>
                <div className="text-3xl font-bold text-purple-600 mb-6">${selectedProduct.price.toFixed(2)}</div>
                <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description}</p>
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => handleEditClick(selectedProduct)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    <i className="fas fa-edit mr-2"></i>Edit Product
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedProduct)}
                    className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Product ID:</span>
                      <br />
                      <span className="font-medium">{selectedProduct.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <br />
                      <span className="font-medium">{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Page */}
      {currentView === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              <i className="fas fa-cog mr-3 text-purple-600"></i>Product Management
            </h1>
            <button
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              <i className="fas fa-plus mr-2"></i>Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <i className="fas fa-box-open text-4xl mb-3 block"></i>
                        <p>No products yet. Add your first product!</p>
                      </td>
                    </tr>
                  ) : (
                    allProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img
                            src={product.image || 'https://via.placeholder.com/60x60?text=No+Image'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=No+Image' }}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                        <td className="px-6 py-4 text-purple-600 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{product.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product)
                                setCurrentView('detail')
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button onClick={() => handleEditClick(product)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition" title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button onClick={() => handleDeleteClick(product)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-2xl hover:opacity-75">
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Classic Cotton T-Shirt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe the product..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="29.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for default image</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : formData.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash-alt text-2xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Product?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50 text-white ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
