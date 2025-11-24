import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getBenefit, isBookmarked, addBookmark, removeBookmark } from '../services/firestore';
import { differenceInDays } from 'date-fns';

const BenefitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);

  const { data: benefit, isLoading } = useQuery({
    queryKey: ['benefit', id],
    queryFn: () => getBenefit(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (user && id) {
      isBookmarked(user.uid, id).then(setBookmarked);
    }
  }, [user, id]);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) return;
      if (bookmarked) {
        await removeBookmark(user.uid, id);
      } else {
        await addBookmark(user.uid, id);
      }
    },
    onSuccess: () => {
      setBookmarked(!bookmarked);
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.uid] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!benefit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">사업을 찾을 수 없습니다</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const deadline = benefit.applyEnd.toDate();
  const daysLeft = differenceInDays(deadline, new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 hover:underline"
        >
          ← 뒤로가기
        </button>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                  {benefit.category}
                </span>
                {daysLeft <= 7 && daysLeft >= 0 && (
                  <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">
                    마감 임박 ({daysLeft}일)
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{benefit.title}</h1>
            </div>
            {user && (
              <button
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className={`px-4 py-2 rounded ${
                  bookmarked
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {bookmarked ? '★ 북마크됨' : '☆ 북마크'}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">쉬운 요약</h2>
              <p className="text-gray-700">{benefit.summaryEasy}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">대상/조건</h2>
              <div className="bg-gray-50 rounded p-4 space-y-2">
                <div>
                  <span className="font-medium">연령: </span>
                  {benefit.targetAgeMin}세 ~ {benefit.targetAgeMax}세
                </div>
                <div>
                  <span className="font-medium">지역: </span>
                  {benefit.region === 'ALL' ? '전국' : benefit.region}
                </div>
                <div>
                  <span className="font-medium">소득 조건: </span>
                  {benefit.incomeCondition === 'none'
                    ? '없음'
                    : benefit.incomeCondition === 'low'
                    ? '저소득'
                    : benefit.incomeCondition === 'mid'
                    ? '중소득'
                    : '고소득'}
                </div>
                <div>
                  <span className="font-medium">보호자 필요: </span>
                  {benefit.guardianRequired === 'irrelevant'
                    ? '무관'
                    : benefit.guardianRequired === 'required'
                    ? '필수'
                    : '불필요'}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">신청 기간</h2>
              <p className="text-gray-700">
                {benefit.applyStart.toDate().toLocaleDateString('ko-KR')} ~{' '}
                {benefit.applyEnd.toDate().toLocaleDateString('ko-KR')}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">필요 서류</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {benefit.requiredDocs.length > 0 ? (
                  benefit.requiredDocs.map((doc, idx) => <li key={idx}>{doc}</li>)
                ) : (
                  <li className="text-gray-500">없음</li>
                )}
              </ul>
            </div>

            <div>
              <a
                href={benefit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                신청하러 가기 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitDetailPage;


