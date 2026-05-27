import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/context/AuthContext';
import { ObrasProvider } from '@/context/ObrasContext';
import { LanguageProvider } from '@/context/LanguageContext';
import RotaProtegida from '@/components/admin/RotaProtegida';
import Header from '@/components/public/Header';

import Inicio from '@/pages/public/Inicio';
import Catalogo from '@/pages/public/Catalogo';
import Obra from '@/pages/public/Obra';
import Sobre from '@/pages/public/Sobre';
import Contato from '@/pages/public/Contato';

const Login             = lazy(() => import('@/pages/admin/Login'));
const Dashboard         = lazy(() => import('@/pages/admin/Dashboard'));
const ObraForm          = lazy(() => import('@/pages/admin/ObraForm'));
const Configuracoes     = lazy(() => import('@/pages/admin/Configuracoes'));
const Participacoes     = lazy(() => import('@/pages/admin/Participacoes'));
const ParticipacaoForm  = lazy(() => import('@/pages/admin/ParticipacaoForm'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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
    <>
      <AuthProvider>
        <ObrasProvider>
          <LanguageProvider>
            <BrowserRouter>
              <ScrollToTop />
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
                <Route
                  path="/painel-ayume/participacoes"
                  element={
                    <RotaProtegida>
                      <Suspense fallback={null}><Participacoes /></Suspense>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/painel-ayume/participacoes/nova"
                  element={
                    <RotaProtegida>
                      <Suspense fallback={null}><ParticipacaoForm /></Suspense>
                    </RotaProtegida>
                  }
                />
                <Route
                  path="/painel-ayume/participacoes/:id/editar"
                  element={
                    <RotaProtegida>
                      <Suspense fallback={null}><ParticipacaoForm /></Suspense>
                    </RotaProtegida>
                  }
                />

                <Route path="*" element={<Inicio />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </ObrasProvider>
      </AuthProvider>
      <Analytics
        beforeSend={event =>
          event.url.includes('/painel-ayume') ? null : event
        }
      />
    </>
  );
}
