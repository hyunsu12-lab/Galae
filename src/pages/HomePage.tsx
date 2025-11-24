import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getAllBenefits } from '../services/firestore';
import { getUserProfile } from '../services/firestore';
import { recommendBenefits } from '../services/recommendation';
import { differenceInDays } from 'date-fns';

const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: benefits, isLoading: benefitsLoading } = useQuery({
    queryKey: ['benefits'],
    queryFn: getAllBenefits,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (profileLoading || benefitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!profile) {
    navigate('/profile');
    return null;
  }

  const recommended = benefits ? recommendBenefits(benefits, profile) : [];

  const getUrgencyBadge = (deadline: Date) => {
    const days = differenceInDays(deadline, new Date());
    if (days <= 7 && days >= 0) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
          마감 임박 ({days}일)
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">맞춤 추천 지원사업</h1>
          <p className="text-gray-600">당신의 조건에 맞는 지원사업을 추천합니다.</p>
        </div>

        {recommended.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">추천할 수 있는 지원사업이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/benefits/${benefit.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {benefit.category}
                    </span>
                    {getUrgencyBadge(benefit.applyEnd.toDate())}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {benefit.summaryEasy}
                  </p>
                  <div className="text-xs text-gray-500">
                    마감: {benefit.applyEnd.toDate().toLocaleDateString('ko-KR')}
                  </div>
                  {benefit.score > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      추천 점수: {benefit.score}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;


