# 🎯 Galae - 청소년 지원사업 추천 플랫폼

React + TypeScript + Firebase를 사용한 MVP 웹 애플리케이션입니다.  
청소년/청년이 받을 수 있는 정부/지자체/민간 지원사업을 개인 조건 기반으로 자동 추천해주는 플랫폼입니다.

---

## ✨ 주요 기능

### 👤 사용자 기능
- ✅ **회원가입/로그인** - Firebase Auth 기반 이메일 인증
- ✅ **프로필 관리** - 이름, 생년월일, 지역(시/도→시/군/구), 학교급, 소득수준, 보호자 여부
- ✅ **맞춤 추천** - 사용자 프로필 기반 지원사업 자동 추천
- ✅ **상세 정보** - 지원사업 상세 페이지 (대상/조건, 신청기간, 필요서류, 신청 링크)
- ✅ **북마크** - 관심 지원사업 저장 및 관리

### 🔧 관리자 기능
- ✅ **지원사업 CRUD** - 사업 추가/수정/삭제
- ✅ **지역별 관리** - 시/도 → 시/군/구 단위 세부 지역 설정
- ✅ **조건 설정** - 연령, 지역, 소득, 보호자 여부 등 다양한 조건 설정

---

## 🚀 빠른 시작

### 1️⃣ 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone https://github.com/hyunsu12-lab/Galae.git
cd Galae

# 의존성 설치
npm install
```

### 2️⃣ Firebase 설정

#### Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. 웹 앱 추가 및 설정 정보 복사

#### 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

#### Firebase 서비스 활성화
- **Authentication**: 이메일/비밀번호 로그인 활성화
- **Firestore Database**: 프로덕션 모드로 생성
- **보안 규칙**: `firestore.rules` 파일 내용을 Firebase Console에 적용

> 📖 자세한 설정 방법은 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) 참고

### 3️⃣ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4️⃣ 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다.

---

## 📦 배포

### Firebase Hosting (권장)

```bash
# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

### 자동 배포 (GitHub Actions)

이미 설정되어 있습니다! `main` 브랜치에 push하면 자동으로 배포됩니다.

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

> 📖 자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

---

## 📁 프로젝트 구조

```
src/
├── components/          # 공통 컴포넌트
│   └── Layout.tsx       # 레이아웃 (네비게이션 바)
├── config/              # 설정 파일
│   ├── firebase.ts      # Firebase 초기화
│   ├── images.ts        # 이미지 경로 설정
│   └── regions.ts       # 한국 지역 데이터
├── pages/               # 페이지 컴포넌트
│   ├── LoginPage.tsx    # 로그인/회원가입
│   ├── ProfilePage.tsx  # 프로필 설정
│   ├── HomePage.tsx     # 추천 리스트
│   ├── BenefitDetailPage.tsx  # 사업 상세
│   ├── BookmarksPage.tsx      # 북마크
│   └── AdminPage.tsx          # 관리자 CRUD
├── services/            # 비즈니스 로직
│   ├── auth.ts          # 인증 서비스
│   ├── firestore.ts     # Firestore CRUD
│   └── recommendation.ts # 추천 알고리즘
├── store/               # 상태 관리
│   └── authStore.ts     # 인증 상태 (Zustand)
├── types/               # TypeScript 타입
│   └── index.ts
├── App.tsx              # 라우터 설정
├── main.tsx             # 엔트리 포인트
└── vite-env.d.ts        # Vite 환경 변수 타입
```

---

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프레임워크** | React 18 + TypeScript |
| **빌드 도구** | Vite |
| **라우팅** | React Router v6 |
| **인증** | Firebase Auth |
| **데이터베이스** | Cloud Firestore |
| **상태 관리** | Zustand |
| **서버 상태** | TanStack Query |
| **스타일링** | TailwindCSS |
| **유틸리티** | date-fns |

---

## 🎨 주요 특징

### 추천 알고리즘
- **룰 기반 필터링**: 연령, 지역, 소득, 보호자 여부 조건 매칭
- **점수 기반 정렬**: 완전일치 > 부분일치, 마감 임박 우선
- **세부 지역 지원**: 시/도 → 시/군/구 단위 추천

### 사용자 경험
- **반응형 디자인**: 모바일/데스크톱 지원
- **직관적인 UI**: TailwindCSS 기반 모던한 디자인
- **실시간 업데이트**: React Query를 통한 자동 데이터 동기화

### 보안
- **Firestore 보안 규칙**: 사용자별 데이터 접근 제어
- **관리자 권한**: 이메일 기반 관리자 접근 제어
- **미성년자 고려**: 만 14세 미만 경고 표시

---

## 📚 데이터 모델

### Users Collection
```typescript
{
  name: string;
  birthDate: string;        // YYYY-MM-DD
  province: string;         // 시/도
  city: string;             // 시/군/구
  region: string;           // 전체 지역 문자열
  schoolLevel: 'middle' | 'high' | 'etc';
  incomeBucket: 'low' | 'mid' | 'high' | null;
  guardianStatus: 'withGuardian' | 'withoutGuardian' | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Benefits Collection
```typescript
{
  title: string;
  category: BenefitCategory;
  targetAgeMin: number;
  targetAgeMax: number;
  region: string;           // 'ALL' or 전체 지역
  province?: string;         // 시/도 (선택)
  city?: string;            // 시/군/구 (선택)
  incomeCondition: 'none' | 'low' | 'mid' | 'high';
  guardianRequired: 'required' | 'not_required' | 'irrelevant';
  applyStart: Timestamp;
  applyEnd: Timestamp;
  requiredDocs: string[];
  summaryEasy: string;
  sourceUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Bookmarks (서브컬렉션)
```
users/{uid}/bookmarks/{benefitId}
```

---

## 🔐 보안 규칙

Firestore 보안 규칙은 `firestore.rules` 파일을 참고하세요.

**주요 규칙:**
- 사용자는 자신의 프로필만 읽기/쓰기 가능
- 모든 사용자는 지원사업 읽기 가능
- 관리자만 지원사업 쓰기 가능 (이메일 기반)

---

## 🚧 향후 확장 계획

- [ ] AI 기반 공고문 자동 추출
- [ ] 크롤링/API 연동으로 자동 데이터 수집
- [ ] 푸시 알림 기능
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 관리자 대시보드 통계
- [ ] 검색 및 필터 기능 강화
- [ ] 다국어 지원

---

## 📖 추가 문서

- [Firebase 설정 가이드](./FIREBASE_SETUP.md)
- [배포 가이드](./DEPLOYMENT.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)
- [계정 전환 가이드](./ACCOUNT_SWITCH_GUIDE.md)

---

## 🤝 기여

이슈나 개선 사항이 있으면 GitHub Issues에 등록해주세요.

---

## 📄 라이선스

MIT License

---

## 👥 개발자

**Galae Team**

---

**Made with ❤️ for Korean Youth**
