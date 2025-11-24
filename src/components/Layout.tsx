import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, isAdmin } from '../store/authStore';
import { logout } from '../services/auth';
import { getUserProfile } from '../services/firestore';
import { IMAGES, LOGO_FALLBACK } from '../config/images';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [logoError, setLogoError] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {!logoError && (
                <img 
                  src={IMAGES.logo} 
                  alt="Galae Logo" 
                  className="h-8 w-auto"
                  onError={() => setLogoError(true)}
                />
              )}
              {LOGO_FALLBACK.showText && (
                <span>Galae</span>
              )}
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    홈
                  </Link>
                  <Link
                    to="/bookmarks"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    북마크
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    프로필
                  </Link>
                  {isAdmin(user.email) && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      관리자
                    </Link>
                  )}
                  <div className="flex items-center gap-3 border-l pl-3 ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.name || user.displayName || user.email?.split('@')[0] || '사용자'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      title="다른 계정으로 로그인하려면 로그아웃하세요"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;


