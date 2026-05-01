import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ObrasProvider } from '@/context/ObrasContext';
import RotaProtegida from '@/components/admin/RotaProtegida';
import Header from '@/components/public/Header';

// Páginas públicas (carregamento imediato)
import Inicio from '@/pages/public/Inicio';
import Catalogo from '@/pages/public/Catalogo';
import Obra from '@/pages/public/Obra';
import Sobre from '@/pages/public/Sobre';
import Contato from '@/pages/public/Contato';

// Páginas admin (lazy loaded)
const Login    = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ObraForm  = lazy(() => import('@/pages/admin/ObraForm'));

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ObrasProvider>
        <BrowserRouter>
          <Routes>
            {/* Vitrine pública */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/obra/:slug" element={<Obra />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
            </Route>

            {/* Login — sem proteção e sem layout admin */}
            <Route
              path="/painel-ayume/login"
              element={
                <Suspense fallback={null}>
                  <Login />
                </Suspense>
              }
            />

            {/* Rotas admin protegidas */}
            <Route
              path="/painel-ayume/dashboard"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}>
                    <Dashboard />
                  </Suspense>
                </RotaProtegida>
              }
            />
            <Route
              path="/painel-ayume/obras/nova"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}>
                    <ObraForm />
                  </Suspense>
                </RotaProtegida>
              }
            />
            <Route
              path="/painel-ayume/obras/:slug/editar"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}>
                    <ObraForm />
                  </Suspense>
                </RotaProtegida>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Inicio />} />
          </Routes>
        </BrowserRouter>
      </ObrasProvider>
    </AuthProvider>
  );
}
