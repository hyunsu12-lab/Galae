# 빠른 시작 가이드

## 1. .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

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
- 따옴표(`"`) 없이 값만 입력
- `VITE_` 접두사는 반드시 필요합니다
- `VITE_ADMIN_EMAIL`은 관리자 페이지 접근에 사용할 이메일 주소입니다

## 2. Firebase 프로젝트 설정

### 2.1 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 후 생성

### 2.2 웹 앱 추가
1. 프로젝트 설정 (⚙️) > 내 앱 > 웹 아이콘 (</>) 클릭
2. 앱 닉네임 입력 후 "앱 등록"
3. 나타나는 `firebaseConfig` 값들을 `.env` 파일에 복사

### 2.3 Authentication 활성화
1. 왼쪽 메뉴: **Authentication** > 시작하기
2. **Sign-in method** 탭 > **이메일/비밀번호** > 사용 설정 > 저장

### 2.4 Firestore Database 생성
1. 왼쪽 메뉴: **Firestore Database** > 데이터베이스 만들기
2. **프로덕션 모드에서 시작** 선택
3. 위치 선택 (예: `asia-northeast3` - 서울)
4. 사용 설정

### 2.5 Firestore 보안 규칙 설정
1. Firestore Database > **규칙** 탭
2. `firestore.rules` 파일 내용 복사
3. **중요**: `YOUR_ADMIN_EMAIL@example.com`을 실제 관리자 이메일로 변경
4. **게시** 클릭

## 3. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 표시된 주소)로 접속

## 4. 테스트

1. 회원가입: `/login`에서 새 계정 생성
2. 프로필 입력: `/profile`에서 정보 입력
3. 관리자 접근: `.env`의 `VITE_ADMIN_EMAIL`로 로그인 후 `/admin` 접근

## 문제 해결

### 환경 변수가 적용되지 않음
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 서버 재시작 (`npm run dev` 중지 후 다시 시작)
- `VITE_` 접두사 확인

### Firestore 권한 오류
- 보안 규칙에서 관리자 이메일이 정확한지 확인
- 규칙이 게시되었는지 확인

### Authentication 오류
- 이메일/비밀번호 로그인이 활성화되었는지 확인

## 상세 가이드

더 자세한 내용은 `FIREBASE_SETUP.md` 파일을 참고하세요.


