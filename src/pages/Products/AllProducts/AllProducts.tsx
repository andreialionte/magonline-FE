import { useState, useEffect } from 'react';
import { Search, Filter, Package, DollarSign, Edit, Trash2, Eye, Plus, LogIn, UserPlus } from 'lucide-react';
import ky from 'ky';
import type Product from '../../../core/model/Product';

export default function AllProducts() {
  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  })();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [nameFilter, setNameFilter] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ky.get('http://localhost:5000/api/products/getproducts').json<Product[]>();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;

    if (nameFilter) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
    }

    setFilteredProducts(filtered);
  }, [nameFilter, minPrice, maxPrice, products]);

  const handleDelete = async (id: string) => {
    const user = currentUser;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const prod = products.find(p => p.id === id);
    if (!prod) {
      alert('Product not found');
      return;
    }

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const isOwner = (prod.sellerId && prod.sellerId === user.id) || prod.sellerName === fullName || prod.sellerName === user.email;
    console.debug('delete check', { prodSellerId: prod.sellerId, userId: user.id, prodSellerName: prod.sellerName, fullName, userEmail: user.email, isOwner });
    if (!isOwner) {
      alert('You are not authorized to delete this product');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await ky.delete(`http://localhost:5000/api/products/deleteProduct`, {
        json: id
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
      console.error(err);
    }
  };

  const clearFilters = () => {
    setNameFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600">Manage your product inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 pr-2">
                    <div className="text-sm text-gray-700">{`Hi, ${currentUser.firstName || currentUser.email}`}</div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => window.location.href = '/register'}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  if (!currentUser) {
                    window.location.href = '/login';
                  } else {
                    window.location.href = '/new-product';
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="999999"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {(nameFilter || minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.subcategory}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">${product.price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          product.quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.quantity} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {product.sellerName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.location.href = `/product/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {currentUser && ((product.sellerId && currentUser.id === product.sellerId) || product.sellerName === `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || product.sellerName === currentUser.email) && (
                            <>
                              <button
                                onClick={() => window.location.href = `/edit-product/${product.id}`}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit product"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete product"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filteredProducts.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}