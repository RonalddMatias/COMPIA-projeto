import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import CartPage from './pages/CartPage';
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
              
              {/* Rota pública - carrinho */}
              <Route path="cart" element={<CartPage />} />

              {/* Rotas para Editor e Admin */}
              <Route
                path="products/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                    <ProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                    <CategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
                    <CategoryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
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

