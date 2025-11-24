import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getUserBookmarks } from '../services/firestore';
import { getBenefit } from '../services/firestore';
import { differenceInDays } from 'date-fns';

const BookmarksPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks', user?.uid],
    queryFn: () => getUserBookmarks(user!.uid),
    enabled: !!user,
  });

  const benefitIds = bookmarks?.map((b) => b.benefitId) || [];
  const { data: benefits, isLoading: benefitsLoading } = useQuery({
    queryKey: ['bookmarkedBenefits', benefitIds],
    queryFn: async () => {
      if (!benefitIds.length) return [];
      const promises = benefitIds.map((id) => getBenefit(id));
      const results = await Promise.all(promises);
      return results.filter((b): b is NonNullable<typeof b> => b !== null);
    },
    enabled: benefitIds.length > 0,
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (bookmarksLoading || benefitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">북마크한 지원사업</h1>
          <p className="text-gray-600">저장한 지원사업을 확인하세요.</p>
        </div>

        {!benefits || benefits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">북마크한 지원사업이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const daysLeft = differenceInDays(benefit.applyEnd.toDate(), new Date());
              return (
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
                      {daysLeft <= 7 && daysLeft >= 0 && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          마감 임박 ({daysLeft}일)
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {benefit.summaryEasy}
                    </p>
                    <div className="text-xs text-gray-500">
                      마감: {benefit.applyEnd.toDate().toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;


