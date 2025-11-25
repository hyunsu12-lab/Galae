import { differenceInDays } from 'date-fns';
import type { Benefit, BenefitWithScore, UserProfile } from '../types';

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const recommendBenefits = (benefits: Benefit[], userProfile: UserProfile): BenefitWithScore[] => {
  const userAge = calculateAge(userProfile.birthDate);
  const now = new Date();

  const scored: BenefitWithScore[] = benefits
    .map((benefit) => {
      let score = 0;

      // Age check
      const ageMatch = userAge >= benefit.targetAgeMin && userAge <= benefit.targetAgeMax;
      if (!ageMatch) return null;

      // Region check
      // benefit.region can be 'ALL', province name, or full region string (province + city)
      let regionMatch = false;
      if (benefit.region === 'ALL') {
        regionMatch = true;
      } else if (benefit.province && benefit.city) {
        // 세부 지역 지정 (시/도 + 시/군/구)
        if (benefit.province === userProfile.province && benefit.city === userProfile.city) {
          regionMatch = true;
        } else if (benefit.province === userProfile.province && !benefit.city) {
          // 시/도만 일치
          regionMatch = true;
        }
      } else if (benefit.province) {
        // 시/도만 지정
        if (benefit.province === userProfile.province) {
          regionMatch = true;
        }
      } else {
        // 기존 형식 호환성 (region 문자열로만 저장된 경우)
        if (benefit.region === userProfile.province || benefit.region === userProfile.region) {
          regionMatch = true;
        } else if (userProfile.region && userProfile.region.includes(benefit.region)) {
          regionMatch = true;
        } else if (userProfile.province && benefit.region.includes(userProfile.province)) {
          regionMatch = true;
        }
      }
      if (!regionMatch) return null;

      // Income check
      const incomeMatch =
        benefit.incomeCondition === 'none' ||
        (userProfile.incomeBucket && benefit.incomeCondition === userProfile.incomeBucket);
      if (!incomeMatch) return null;

      // Guardian check
      let guardianMatch = false;
      if (benefit.guardianRequired === 'irrelevant') {
        guardianMatch = true;
      } else if (benefit.guardianRequired === 'required') {
        guardianMatch = userProfile.guardianStatus === 'withGuardian';
      } else if (benefit.guardianRequired === 'not_required') {
        guardianMatch = userProfile.guardianStatus === 'withoutGuardian' || userProfile.guardianStatus === null;
      }

      if (!guardianMatch) return null;

      // All conditions passed

      // Score calculation
      // Complete match: all specific conditions match (not 'ALL' or 'none' or 'irrelevant')
      const hasSpecificRegion = benefit.region !== 'ALL';
      const hasSpecificIncome = benefit.incomeCondition !== 'none';
      const hasSpecificGuardian = benefit.guardianRequired !== 'irrelevant';

      let specificMatches = 0;
      if (hasSpecificRegion && regionMatch) specificMatches++;
      if (hasSpecificIncome && incomeMatch) specificMatches++;
      if (hasSpecificGuardian && guardianMatch) specificMatches++;

      if (specificMatches >= 2) {
        score += 2; // Complete match
      } else {
        score += 1; // Partial match
      }

      // Deadline urgency (7 days or less)
      const applyEnd = benefit.applyEnd.toDate();
      const daysUntilDeadline = differenceInDays(applyEnd, now);
      if (daysUntilDeadline <= 7 && daysUntilDeadline >= 0) {
        score += 1;
      }

      return {
        ...benefit,
        score,
      };
    })
    .filter((b): b is BenefitWithScore => b !== null)
    .sort((a, b) => {
      // Sort by score (desc), then by deadline (asc)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aDeadline = a.applyEnd.toDate().getTime();
      const bDeadline = b.applyEnd.toDate().getTime();
      return aDeadline - bDeadline;
    });

  return scored;
};


