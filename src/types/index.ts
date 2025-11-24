import { Timestamp } from 'firebase/firestore';

export type SchoolLevel = 'middle' | 'high' | 'etc';
export type IncomeBucket = 'low' | 'mid' | 'high' | null;
export type GuardianStatus = 'withGuardian' | 'withoutGuardian' | null;
export type BenefitCategory = 'scholarship' | 'education' | 'career' | 'voucher' | 'experience' | 'discount' | 'contest' | 'etc';
export type IncomeCondition = 'none' | 'low' | 'mid' | 'high';
export type GuardianRequired = 'required' | 'not_required' | 'irrelevant';

export interface UserProfile {
  name: string; // 사용자 이름
  birthDate: string; // YYYY-MM-DD
  province: string; // 시/도
  city: string; // 시/군/구
  region: string; // 전체 지역 (province + city, 호환성을 위해 유지)
  schoolLevel: SchoolLevel;
  incomeBucket: IncomeBucket;
  guardianStatus: GuardianStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Benefit {
  id?: string;
  title: string;
  category: BenefitCategory;
  targetAgeMin: number;
  targetAgeMax: number;
  region: string; // 'ALL' or 전체 지역 문자열 (province + city 또는 province만)
  province?: string; // 시/도 (선택사항, 세부 지역 지정 시)
  city?: string; // 시/군/구 (선택사항, 세부 지역 지정 시)
  incomeCondition: IncomeCondition;
  guardianRequired: GuardianRequired;
  applyStart: Timestamp;
  applyEnd: Timestamp;
  requiredDocs: string[];
  summaryEasy: string;
  sourceUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BenefitWithScore extends Benefit {
  score: number;
}

export interface Bookmark {
  benefitId: string;
  createdAt: Timestamp;
}


