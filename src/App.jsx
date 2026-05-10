import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ObrasProvider } from '@/context/ObrasContext';
import RotaProtegida from '@/components/admin/RotaProtegida';
import Header from '@/components/public/Header';

import Inicio from '@/pages/public/Inicio';
import Catalogo from '@/pages/public/Catalogo';
import Obra from '@/pages/public/Obra';
import Sobre from '@/pages/public/Sobre';
import Contato from '@/pages/public/Contato';

const Login          = lazy(() => import('@/pages/admin/Login'));
const Dashboard      = lazy(() => import('@/pages/admin/Dashboard'));
const ObraForm       = lazy(() => import('@/pages/admin/ObraForm'));
const Configuracoes  = lazy(() => import('@/pages/admin/Configuracoes'));

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
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/obra/:slug" element={<Obra />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
            </Route>

            <Route
              path="/painel-ayume/login"
              element={<Suspense fallback={null}><Login /></Suspense>}
            />

            <Route
              path="/painel-ayume/dashboard"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}><Dashboard /></Suspense>
                </RotaProtegida>
              }
            />
            <Route
              path="/painel-ayume/obras/nova"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}><ObraForm /></Suspense>
                </RotaProtegida>
              }
            />
            <Route
              path="/painel-ayume/obras/:slug/editar"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}><ObraForm /></Suspense>
                </RotaProtegida>
              }
            />
            <Route
              path="/painel-ayume/configuracoes"
              element={
                <RotaProtegida>
                  <Suspense fallback={null}><Configuracoes /></Suspense>
                </RotaProtegida>
              }
            />

            <Route path="*" element={<Inicio />} />
          </Routes>
        </BrowserRouter>
      </ObrasProvider>
    </AuthProvider>
  );
}
