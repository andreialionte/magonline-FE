import { useState, useEffect } from 'react';
import { Package, DollarSign, Hash, Tag, User, FileText, ArrowLeft, Edit } from 'lucide-react';
import ky from 'ky';
import { useParams } from 'react-router-dom';
import type Product from '../../../core/model/Product';

export default function ProductDetails() {
  const { id } = useParams() as { id?: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) {
      setError('No product id provided');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ky.get(`http://localhost:5000/api/products/getproduct?id=${id}`).json<Product>();
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Product not found'}</p>
          <button
            onClick={() => (window.location.href = '/products')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        
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
            <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
            <p className="text-gray-600 mt-2">View complete product information</p>
          </div>

          
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {product.name}
                </div>
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none">
                  {(product as any).description || 'No description available'}
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    ${product.price}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    {product.quantity}
                  </div>
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {product.category}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <div className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {product.subcategory}
                </div>
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {product.sellerName}
                </div>
              </div>
            </div>

            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => (window.location.href = '/products')}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Back to Products
              </button>
              <button
                onClick={() => (window.location.href = `/edit-product/${product.id}`)}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}