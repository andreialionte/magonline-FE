import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Package, DollarSign, Hash, Tag, User, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import ky from 'ky';
import type Product from '../../../core/model/Product';

interface FormState {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  subcategory: string;
  sellerName: string;
}

export default function NewProduct() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    subcategory: '',
    sellerName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        sellerName: `${parsedUser.firstName} ${parsedUser.lastName}`
      }));
    } catch (_) {
      window.location.href = '/login';
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.description || !formData.price || !formData.quantity || 
        !formData.category || !formData.subcategory || !formData.sellerName) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    if (parseInt(formData.quantity) < 0) {
      setError('Quantity cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const user = localStorage.getItem('user');
      if (!user) {
        window.location.href = '/login';
        return;
      }
      const parsedUser = JSON.parse(user);

      const productDto: Omit<Product, 'id'> = {
        name: formData.name,
        subcategory: formData.subcategory || undefined,
        category: formData.category || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        sellerName: formData.sellerName || undefined,
        sellerId: parsedUser.id,
        description: formData.description
      } as Omit<Product, 'id'>;

      await ky.post('http://localhost:5000/api/products/createproduct', {
        json: productDto
      }).json();

      setSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/products';
      }, 2000);
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Created!</h2>
          <p className="text-gray-600 mb-4">Redirecting to products page...</p>
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-green-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => window.location.href = '/products'}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-2">Fill in the product details below</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g., Wireless Mouse"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g., Electronics"
                />
              </div>

              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <input
                  id="subcategory"
                  name="subcategory"
                  type="text"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g., Accessories"
                />
              </div>
            </div>

            {/* Seller Name */}
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
                Seller Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="sellerName"
                  name="sellerName"
                  type="text"
                  value={formData.sellerName}
                  onChange={handleChange}
                  readOnly
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                  placeholder="Your name or company"
                />
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => window.location.href = '/products'}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}