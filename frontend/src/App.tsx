import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas sem layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Layout geral - público e privado */}
            <Route path="/" element={<Layout />}>
              {/* Rota pública - página inicial (produtos) */}
              <Route path="products" element={<ProductList />} />
              <Route index element={<ProductList />} />
              
              {/* Rota protegida - Dashboard */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Carrinho e checkout (mock) */}
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Rotas para Vendedor e Admin */}
              <Route
                path="products/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.VENDEDOR, UserRole.ADMIN]}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.VENDEDOR, UserRole.ADMIN]}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route path="categories" element={<CategoryList />} />
              <Route
                path="categories/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.VENDEDOR, UserRole.ADMIN]}>
                    <CategoryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.VENDEDOR, UserRole.ADMIN]}>
                    <CategoryForm />
                  </ProtectedRoute>
                }
              />

              {/* Rotas apenas para Admin */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

