import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const BenefitDetailPage = lazy(() => import('./pages/BenefitDetailPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <HomePage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/benefits/:id"
              element={
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <BenefitDetailPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <BookmarksPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/admin"
              element={
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


