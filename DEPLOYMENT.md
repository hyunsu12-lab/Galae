# 배포 가이드

## 로컬 빌드 및 테스트

### 1. 빌드
```bash
npm run build
```

빌드가 성공하면 `dist` 폴더에 배포 가능한 파일들이 생성됩니다.

### 2. 로컬에서 빌드 결과 미리보기
```bash
npm run preview
```

브라우저에서 `http://localhost:4173`으로 접속하여 배포 전 결과를 확인할 수 있습니다.

## Firebase Hosting 배포

### 1. 수동 배포

```bash
# 빌드
npm run build

# Firebase Hosting에 배포
firebase deploy --only hosting
```

### 2. 자동 배포 (GitHub Actions)

이미 설정이 완료되었습니다! 

- `main` 브랜치에 push하면 자동으로 배포됩니다
- Pull Request가 생성되면 미리보기 채널에 배포됩니다

#### GitHub Actions 워크플로우 파일:
- `.github/workflows/firebase-hosting-merge.yml` - main 브랜치 머지 시 배포
- `.github/workflows/firebase-hosting-pull-request.yml` - PR 생성 시 미리보기 배포

### 3. 배포 확인

배포가 완료되면 다음 URL로 접속할 수 있습니다:
- 프로덕션: `https://galae-a1b16.web.app` 또는 `https://galae-a1b16.firebaseapp.com`

## 배포 전 체크리스트

- [ ] `.env` 파일이 올바르게 설정되었는지 확인
- [ ] Firebase 프로젝트 설정이 올바른지 확인
- [ ] Firestore 보안 규칙이 설정되었는지 확인
- [ ] Authentication이 활성화되었는지 확인
- [ ] 빌드가 성공적으로 완료되는지 확인 (`npm run build`)
- [ ] 로컬에서 미리보기가 정상 작동하는지 확인 (`npm run preview`)

## 환경 변수 설정 (프로덕션)

프로덕션 환경에서는 Firebase Hosting의 환경 변수를 사용하거나, 빌드 시 환경 변수를 포함해야 합니다.

### 방법 1: 빌드 시 환경 변수 포함 (권장)

`.env.production` 파일을 생성하고 프로덕션 환경 변수를 설정:

```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

빌드 시 자동으로 사용됩니다.

### 방법 2: GitHub Secrets 사용

GitHub Actions에서 환경 변수를 secrets로 설정할 수 있습니다:
1. GitHub 저장소 > Settings > Secrets and variables > Actions
2. 필요한 환경 변수를 secrets로 추가
3. 워크플로우 파일에서 사용

## 문제 해결

### 빌드 오류
- TypeScript 오류 확인: `npm run build` 실행 시 오류 메시지 확인
- 의존성 문제: `npm install` 재실행

### 배포 오류
- Firebase 로그인 확인: `firebase login`
- 프로젝트 확인: `firebase projects:list`
- 현재 프로젝트 확인: `firebase use`

### 환경 변수 문제
- `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- 빌드된 파일에 환경 변수가 포함되어 있는지 확인

## 추가 리소스

- [Firebase Hosting 문서](https://firebase.google.com/docs/hosting)
- [Vite 빌드 가이드](https://vitejs.dev/guide/build.html)

