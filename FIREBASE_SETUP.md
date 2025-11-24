# Firebase 설정 가이드

## 1단계: Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `galae-app`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2단계: 웹 앱 추가

1. Firebase Console에서 프로젝트 선택
2. 왼쪽 메뉴에서 **⚙️ 프로젝트 설정** 클릭
3. 아래로 스크롤하여 **내 앱** 섹션에서 **</> 웹** 아이콘 클릭
4. 앱 닉네임 입력 (예: `Galae Web App`)
5. **"Firebase Hosting도 설정"** 체크박스는 선택 안 해도 됩니다
6. **앱 등록** 클릭

## 3단계: Firebase 설정 정보 복사

앱 등록 후 나타나는 설정 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

이 정보를 `.env` 파일에 입력합니다.

## 4단계: Authentication 활성화

1. Firebase Console 왼쪽 메뉴에서 **Authentication** 클릭
2. **시작하기** 클릭
3. **Sign-in method** 탭 클릭
4. **이메일/비밀번호** 클릭
5. **사용 설정** 토글을 켜기
6. **저장** 클릭

## 5단계: Firestore Database 생성

1. Firebase Console 왼쪽 메뉴에서 **Firestore Database** 클릭
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드에서 시작** 선택 (나중에 보안 규칙 설정)
4. 위치 선택 (예: `asia-northeast3` - 서울)
5. **사용 설정** 클릭

## 6단계: Firestore 보안 규칙 설정

1. Firestore Database 페이지에서 **규칙** 탭 클릭
2. 다음 규칙을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Bookmarks subcollection
      match /bookmarks/{bookmarkId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Benefits collection
    match /benefits/{benefitId} {
      // Everyone can read benefits
      allow read: if true;
      
      // Only admins can write (check by email from .env)
      // Note: 실제 운영 환경에서는 더 안전한 방법 사용 권장
      allow write: if request.auth != null && 
        request.auth.token.email == 'YOUR_ADMIN_EMAIL@example.com';
    }
  }
}
```

3. `YOUR_ADMIN_EMAIL@example.com`을 실제 관리자 이메일로 변경
4. **게시** 클릭

## 7단계: .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```env
VITE_FIREBASE_API_KEY=여기에_apiKey_입력
VITE_FIREBASE_AUTH_DOMAIN=여기에_authDomain_입력
VITE_FIREBASE_PROJECT_ID=여기에_projectId_입력
VITE_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_입력
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_입력
VITE_FIREBASE_APP_ID=여기에_appId_입력
VITE_ADMIN_EMAIL=여기에_관리자_이메일_입력
```

**중요**: 
- 따옴표 없이 값만 입력
- 실제 Firebase Console에서 복사한 값 사용
- `VITE_ADMIN_EMAIL`은 관리자로 사용할 이메일 주소

## 8단계: 테스트

1. 터미널에서 `npm install` 실행
2. `npm run dev` 실행
3. 브라우저에서 앱 열기
4. 회원가입 테스트
5. 관리자 이메일로 로그인하여 `/admin` 페이지 접근 테스트

## 문제 해결

### 환경 변수가 로드되지 않는 경우
- `.env` 파일이 프로젝트 루트에 있는지 확인
- Vite는 `VITE_` 접두사가 필요합니다
- 서버 재시작 필요 (`npm run dev` 중지 후 다시 시작)

### Firestore 권한 오류
- 보안 규칙이 올바르게 게시되었는지 확인
- 관리자 이메일이 정확히 일치하는지 확인

### Authentication 오류
- Authentication이 활성화되었는지 확인
- 이메일/비밀번호 로그인 방법이 활성화되었는지 확인


