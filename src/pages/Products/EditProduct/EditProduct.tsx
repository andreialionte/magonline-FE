import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Package, DollarSign, Hash, Tag, User, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import ky from 'ky';
import { useParams } from 'react-router-dom';
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

export default function EditProduct() {
  const { id } = useParams() as { id?: string };

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    subcategory: '',
    sellerName: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  })();

  useEffect(() => {
    if (!id) {
      setError('No product id provided');
      setLoading(false);
      return;
    }

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await ky.get(`http://localhost:5000/api/products/getproduct?id=${id}`).json<Product>();
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          quantity: String(product.quantity ?? ''),
          category: product.category || '',
          subcategory: product.subcategory || '',
          sellerName: product.sellerName || ''
        });
        
        const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        const owner = (product.sellerId && currentUser && product.sellerId === currentUser.id) || product.sellerName === fullName || product.sellerName === currentUser.email;
        console.debug('edit ownership', { productSellerId: product.sellerId, currentUserId: currentUser.id, productSellerName: product.sellerName, fullName, currentUserEmail: currentUser.email, owner });
        setIsOwner(Boolean(owner));
        if (!owner) {
          setError('You are not authorized to edit this product');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    
    if (!formData.name || !formData.description || !formData.price || !formData.quantity ||
        !formData.category || !formData.subcategory || !formData.sellerName) {
      setError('Please fill in all fields');
      setSaving(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setSaving(false);
      return;
    }

    if (parseInt(formData.quantity, 10) < 0) {
      setError('Quantity cannot be negative');
      setSaving(false);
      return;
    }

    try {
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }

      if (!isOwner) {
        setError('You are not authorized to update this product');
        setSaving(false);
        return;
      }

      const productDto: Product = {
        id: id as string,
        name: formData.name,
        subcategory: formData.subcategory || undefined,
        category: formData.category || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        sellerName: formData.sellerName || undefined,
        description: formData.description,
        sellerId: currentUser.id
      };

      await ky.put('http://localhost:5000/api/products/updateproduct', { json: productDto }).json();

      setSuccess(true);
      setTimeout(() => (window.location.href = '/products'), 2000);
    } catch (err) {
      setError('Failed to update product. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Updated!</h2>
          <p className="text-gray-600 mb-4">Redirecting to products page...</p>
        </div>
      </div>
    );
  }

  if (!loading && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authorized</h2>
          <p className="text-gray-600">You are not allowed to edit this product.</p>
          <div className="mt-4 flex justify-center">
            <button onClick={() => (window.location.href = '/products')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Back to Products</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => (window.location.href = '/products')}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-2">Update the product details below</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input id="category" name="category" type="text" value={formData.category} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>

              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                <input id="subcategory" name="subcategory" type="text" value={formData.subcategory} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
            </div>

            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">Seller Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input id="sellerName" name="sellerName" type="text" value={formData.sellerName} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => (window.location.href = '/products')}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {saving ? 'Saving...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}