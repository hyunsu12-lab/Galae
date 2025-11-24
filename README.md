# Galae - 청소년 지원사업 추천 플랫폼

React + TypeScript + Firebase를 사용한 MVP 웹 애플리케이션입니다.

## 기능

- **사용자 기능**
  - 회원가입/로그인 (Firebase Auth)
  - 프로필 입력/수정
  - 맞춤 추천 리스트
  - 지원사업 상세 페이지
  - 북마크 기능

- **관리자 기능**
  - 지원사업 CRUD (추가/수정/삭제)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 설정

1. Firebase Console에서 새 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호)
3. Firestore Database 생성
4. 프로젝트 설정에서 웹 앱 추가
5. `.env` 파일 생성 (`.env.example` 참고):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=admin@example.com
```

### 3. Firestore 보안 규칙 설정

Firebase Console > Firestore Database > Rules에서 `firestore.rules` 내용을 복사하여 설정하거나, MVP 단계에서는 다음 규칙을 사용할 수 있습니다:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /bookmarks/{bookmarkId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /benefits/{benefitId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email == 'your_admin_email@example.com';
    }
  }
}
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 빌드

```bash
npm run build
```

## 배포

### Firebase Hosting

1. Firebase CLI 설치:
```bash
npm install -g firebase-tools
```

2. Firebase 로그인:
```bash
firebase login
```

3. 프로젝트 초기화:
```bash
firebase init hosting
```

4. 배포:
```bash
npm run build
firebase deploy --only hosting
```

### Vercel/Netlify

빌드된 `dist` 폴더를 업로드하거나, Git 연동을 통해 자동 배포할 수 있습니다.

## 프로젝트 구조

```
src/
├── components/     # 공통 컴포넌트
├── config/         # Firebase 설정
├── pages/          # 페이지 컴포넌트
├── services/       # Firestore/Auth 서비스
├── store/          # Zustand 상태 관리
├── types/          # TypeScript 타입 정의
├── App.tsx         # 라우터 설정
└── main.tsx        # 엔트리 포인트
```

## 주요 기술 스택

- **React 18** + **TypeScript**
- **Vite** - 빌드 도구
- **React Router v6** - 라우팅
- **Firebase Auth** - 인증
- **Firestore** - 데이터베이스
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리
- **TailwindCSS** - 스타일링
- **date-fns** - 날짜 처리

## 확장 포인트

- AI 요약/공고문 자동 추출 기능
- 크롤링/API 연동
- 알림 기능
- 소셜 로그인
- 관리자 대시보드 통계

## 라이선스

MIT


