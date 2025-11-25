import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/firestore';
import type { SchoolLevel, IncomeBucket, GuardianStatus } from '../types';
import { getCitiesByProvince, getAllProvinces } from '../config/regions';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('middle');
  const [incomeBucket, setIncomeBucket] = useState<IncomeBucket>(null);
  const [guardianStatus, setGuardianStatus] = useState<GuardianStatus>(null);
  const [showMinorWarning, setShowMinorWarning] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBirthDate(profile.birthDate);
      setProvince(profile.province || '');
      setCity(profile.city || '');
      setSchoolLevel(profile.schoolLevel);
      setIncomeBucket(profile.incomeBucket);
      setGuardianStatus(profile.guardianStatus);
    }
  }, [profile]);

  useEffect(() => {
    if (province) {
      const cities = getCitiesByProvince(province);
      setAvailableCities(cities);
      // 시/도가 변경되면 시/군/구 초기화
      if (!cities.includes(city)) {
        setCity('');
      }
    } else {
      setAvailableCities([]);
      setCity('');
    }
  }, [province, city]);

  useEffect(() => {
    if (birthDate) {
      const age = calculateAge(birthDate);
      if (age < 14) {
        setShowMinorWarning(true);
      } else {
        setShowMinorWarning(false);
      }
    }
  }, [birthDate]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (!name.trim()) {
        throw new Error('이름을 입력해주세요.');
      }
      if (!province || !city) {
        throw new Error('지역을 선택해주세요.');
      }
      const region = `${province} ${city}`;
      const data = {
        name: name.trim(),
        birthDate,
        province,
        city,
        region, // 호환성을 위해 유지
        schoolLevel,
        incomeBucket,
        guardianStatus,
      };
      if (profile) {
        await updateUserProfile(user.uid, data);
      } else {
        await createUserProfile(user.uid, data);
      }
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">프로필 설정</h1>
          <p className="text-gray-600 mb-6">
            맞춤 추천을 위해 최소한의 정보를 수집합니다. 소득 및 보호자 정보는 선택사항입니다.
          </p>

          {showMinorWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⚠️ 만 14세 미만의 경우 보호자 동의가 필요할 수 있습니다.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  시/도 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {getAllProvinces().map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  시/군/구 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!province || availableCities.length === 0}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">시/도를 먼저 선택하세요</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                학교급 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={schoolLevel}
                onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="middle">중학교</option>
                <option value="high">고등학교</option>
                <option value="etc">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">소득 수준 (선택)</label>
              <select
                value={incomeBucket || ''}
                onChange={(e) =>
                  setIncomeBucket(e.target.value === '' ? null : (e.target.value as IncomeBucket))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안 함</option>
                <option value="low">저소득</option>
                <option value="mid">중소득</option>
                <option value="high">고소득</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">보호자 여부 (선택)</label>
              <select
                value={guardianStatus || ''}
                onChange={(e) =>
                  setGuardianStatus(
                    e.target.value === '' ? null : (e.target.value as GuardianStatus)
                  )
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안 함</option>
                <option value="withGuardian">보호자 있음</option>
                <option value="withoutGuardian">보호자 없음</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {mutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


