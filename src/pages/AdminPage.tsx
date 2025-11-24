import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, isAdmin } from '../store/authStore';
import {
  getAllBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
} from '../services/firestore';
import type { Benefit, BenefitCategory, IncomeCondition, GuardianRequired } from '../types';
import { Timestamp } from 'firebase/firestore';
import { REGIONS, getCitiesByProvince, getAllProvinces } from '../config/regions';

const AdminPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Benefit>>({
    title: '',
    category: 'scholarship',
    targetAgeMin: 0,
    targetAgeMax: 99,
    region: 'ALL',
    incomeCondition: 'none',
    guardianRequired: 'irrelevant',
    applyStart: Timestamp.now(),
    applyEnd: Timestamp.now(),
    requiredDocs: [],
    summaryEasy: '',
    sourceUrl: '',
  });
  const [docInput, setDocInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [benefitProvince, setBenefitProvince] = useState('');
  const [benefitCity, setBenefitCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (user && !isAdmin(user.email)) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (benefitProvince) {
      const cities = getCitiesByProvince(benefitProvince);
      setAvailableCities(cities);
      if (!cities.includes(benefitCity)) {
        setBenefitCity('');
      }
    } else {
      setAvailableCities([]);
      setBenefitCity('');
    }
  }, [benefitProvince, benefitCity]);

  const { data: benefits, isLoading } = useQuery({
    queryKey: ['benefits'],
    queryFn: getAllBenefits,
  });

  const createMutation = useMutation({
    mutationFn: createBenefit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      resetForm();
      setSuccess('사업이 성공적으로 추가되었습니다!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || '사업 추가 중 오류가 발생했습니다.');
      setSuccess(null);
      console.error('Create benefit error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Benefit> }) =>
      updateBenefit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      resetForm();
      setEditingId(null);
      setSuccess('사업이 성공적으로 수정되었습니다!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || '사업 수정 중 오류가 발생했습니다.');
      setSuccess(null);
      console.error('Update benefit error:', err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBenefit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      setSuccess('사업이 성공적으로 삭제되었습니다!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || '사업 삭제 중 오류가 발생했습니다.');
      setSuccess(null);
      console.error('Delete benefit error:', err);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'scholarship',
      targetAgeMin: 0,
      targetAgeMax: 99,
      region: 'ALL',
      incomeCondition: 'none',
      guardianRequired: 'irrelevant',
      applyStart: Timestamp.now(),
      applyEnd: Timestamp.now(),
      requiredDocs: [],
      summaryEasy: '',
      sourceUrl: '',
    });
    setDocInput('');
    setBenefitProvince('');
    setBenefitCity('');
    setAvailableCities([]);
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingId(benefit.id!);
    setFormData({
      ...benefit,
      applyStart: benefit.applyStart,
      applyEnd: benefit.applyEnd,
    });
    setDocInput(benefit.requiredDocs.join(', '));
    
    // 지역 정보 파싱
    if (benefit.region && benefit.region !== 'ALL') {
      if (benefit.province && benefit.city) {
        setBenefitProvince(benefit.province);
        setBenefitCity(benefit.city);
      } else {
        // 기존 데이터 호환성: region에서 province 추출 시도
        const provinces = getAllProvinces();
        const matchedProvince = provinces.find(p => benefit.region.includes(p));
        if (matchedProvince) {
          setBenefitProvince(matchedProvince);
          const cities = getCitiesByProvince(matchedProvince);
          const matchedCity = cities.find(c => benefit.region.includes(c));
          if (matchedCity) {
            setBenefitCity(matchedCity);
          }
        }
      }
    } else {
      setBenefitProvince('');
      setBenefitCity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    // 필수 필드 검증
    if (!formData.title?.trim()) {
      setError('사업명을 입력해주세요.');
      return;
    }
    if (!formData.summaryEasy?.trim()) {
      setError('쉬운 요약을 입력해주세요.');
      return;
    }
    if (!formData.sourceUrl?.trim()) {
      setError('신청 링크를 입력해주세요.');
      return;
    }
    if (formData.targetAgeMin === undefined || formData.targetAgeMax === undefined) {
      setError('연령 범위를 입력해주세요.');
      return;
    }
    if (!formData.applyStart || !formData.applyEnd) {
      setError('신청 기간을 입력해주세요.');
      return;
    }

    try {
      const requiredDocs = docInput.split(',').map((d) => d.trim()).filter(Boolean);
      
      // 지역 정보 구성
      let region = 'ALL';
      let province: string | undefined = undefined;
      let city: string | undefined = undefined;
      
      if (benefitProvince) {
        if (benefitCity) {
          region = `${benefitProvince} ${benefitCity}`;
          province = benefitProvince;
          city = benefitCity;
        } else {
          region = benefitProvince;
          province = benefitProvince;
        }
      }
      
      if (editingId) {
        // 수정
        const updateData: Partial<Benefit> = {
          title: formData.title,
          category: formData.category!,
          targetAgeMin: formData.targetAgeMin!,
          targetAgeMax: formData.targetAgeMax!,
          region,
          province,
          city,
          incomeCondition: formData.incomeCondition!,
          guardianRequired: formData.guardianRequired!,
          applyStart: formData.applyStart,
          applyEnd: formData.applyEnd,
          requiredDocs,
          summaryEasy: formData.summaryEasy,
          sourceUrl: formData.sourceUrl,
        };
        updateMutation.mutate({ id: editingId, data: updateData });
      } else {
        // 생성
        const newBenefit: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'> = {
          title: formData.title!,
          category: formData.category!,
          targetAgeMin: formData.targetAgeMin!,
          targetAgeMax: formData.targetAgeMax!,
          region,
          province,
          city,
          incomeCondition: formData.incomeCondition!,
          guardianRequired: formData.guardianRequired!,
          applyStart: formData.applyStart,
          applyEnd: formData.applyEnd,
          requiredDocs,
          summaryEasy: formData.summaryEasy!,
          sourceUrl: formData.sourceUrl!,
          createdBy: user.uid,
        };
        createMutation.mutate(newBenefit);
      }
    } catch (err: any) {
      setError(err.message || '처리 중 오류가 발생했습니다.');
      console.error('Submit error:', err);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">관리자 - 지원사업 관리</h1>
          <p className="text-gray-600">지원사업을 추가, 수정, 삭제할 수 있습니다.</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">✅ {success}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? '사업 수정' : '새 사업 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">사업명 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">카테고리 *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as BenefitCategory })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="scholarship">장학금</option>
                  <option value="education">교육</option>
                  <option value="career">진로</option>
                  <option value="voucher">바우처</option>
                  <option value="experience">체험</option>
                  <option value="discount">할인</option>
                  <option value="contest">공모전</option>
                  <option value="etc">기타</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">최소 연령 *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="99"
                    value={formData.targetAgeMin}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAgeMin: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">최대 연령 *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="99"
                    value={formData.targetAgeMax}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAgeMax: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">지역 *</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">전체 또는 시/도 선택</label>
                    <select
                      value={benefitProvince || 'ALL'}
                      onChange={(e) => {
                        if (e.target.value === 'ALL') {
                          setBenefitProvince('');
                          setBenefitCity('');
                        } else {
                          setBenefitProvince(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="ALL">전체</option>
                      {getAllProvinces().map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  {benefitProvince && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">시/군/구 선택 (선택사항)</label>
                      <select
                        value={benefitCity}
                        onChange={(e) => setBenefitCity(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">전체 (시/도만 선택)</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">소득 조건 *</label>
                <select
                  value={formData.incomeCondition}
                  onChange={(e) =>
                    setFormData({ ...formData, incomeCondition: e.target.value as IncomeCondition })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="none">없음</option>
                  <option value="low">저소득</option>
                  <option value="mid">중소득</option>
                  <option value="high">고소득</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">보호자 필요 여부 *</label>
                <select
                  value={formData.guardianRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardianRequired: e.target.value as GuardianRequired,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="irrelevant">무관</option>
                  <option value="required">필수</option>
                  <option value="not_required">불필요</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">신청 시작일 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      formData.applyStart
                        ? new Date(formData.applyStart.toMillis() - new Date().getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applyStart: Timestamp.fromDate(new Date(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">신청 마감일 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      formData.applyEnd
                        ? new Date(formData.applyEnd.toMillis() - new Date().getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applyEnd: Timestamp.fromDate(new Date(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">필요 서류 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  placeholder="예: 주민등록등본, 가족관계증명서"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">쉬운 요약 *</label>
                <textarea
                  required
                  value={formData.summaryEasy}
                  onChange={(e) => setFormData({ ...formData, summaryEasy: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">신청 링크 *</label>
                <input
                  type="url"
                  required
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setEditingId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">사업 목록</h2>
            {isLoading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {benefits && benefits.length > 0 ? (
                  benefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className="border rounded p-3 hover:bg-gray-50 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{benefit.title}</h3>
                        <p className="text-sm text-gray-600">{benefit.category}</p>
                        <p className="text-xs text-gray-500">
                          {benefit.applyEnd.toDate().toLocaleDateString('ko-KR')} 마감
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(benefit)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(benefit.id!)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">등록된 사업이 없습니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

