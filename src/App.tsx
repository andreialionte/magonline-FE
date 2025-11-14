import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register/Register'
import AllProducts from './pages/Products/AllProducts/AllProducts'
import Login from './pages/Login/Login.'
import NewProduct from './pages/Products/NewProduct/NewProduct'
import EditProduct from './pages/Products/EditProduct/EditProduct'
import ProductDetails from './pages/Products/ProductDetails/ProductDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllProducts/>} />
        <Route path="/products" element={<AllProducts/>} />
        <Route path="/new-product" element={<NewProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App