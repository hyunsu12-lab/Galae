# 문제 해결 가이드

## 관리자 페이지에서 사업 추가가 안 될 때

### 1. Firestore 보안 규칙 확인

Firebase Console > Firestore Database > 규칙 탭에서 다음을 확인하세요:

```javascript
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
      // ⚠️ 여기의 이메일이 .env의 VITE_ADMIN_EMAIL과 정확히 일치해야 합니다!
      allow write: if request.auth != null && 
        request.auth.token.email == 'YOUR_ADMIN_EMAIL@example.com';
    }
  }
}
```

**중요**: 
- `YOUR_ADMIN_EMAIL@example.com`을 실제 관리자 이메일로 변경
- `.env` 파일의 `VITE_ADMIN_EMAIL`과 정확히 일치해야 함
- 규칙을 변경한 후 반드시 **게시** 버튼 클릭

### 2. 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12 또는 Cmd+Option+I)
2. **Console** 탭 확인
3. 사업 추가 시도 후 에러 메시지 확인

일반적인 에러:
- `Missing or insufficient permissions` → 보안 규칙 문제
- `Permission denied` → 관리자 이메일 불일치
- `Network error` → 인터넷 연결 문제

### 3. 로그인 상태 확인

- 관리자 이메일로 로그인했는지 확인
- 로그아웃 후 다시 로그인 시도

### 4. 필수 필드 확인

다음 필드들이 모두 입력되었는지 확인:
- ✅ 사업명
- ✅ 카테고리
- ✅ 최소/최대 연령
- ✅ 지역
- ✅ 소득 조건
- ✅ 보호자 필요 여부
- ✅ 신청 시작일/마감일
- ✅ 쉬운 요약
- ✅ 신청 링크

### 5. .env 파일 확인

`.env` 파일이 올바르게 설정되었는지 확인:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=your_actual_email@example.com  # ⚠️ 실제 이메일로 변경
```

**중요**: `.env` 파일을 수정한 후에는 개발 서버를 재시작해야 합니다:
```bash
# 서버 중지 (Ctrl+C)
npm run dev  # 다시 시작
```

### 6. Firestore 컬렉션 확인

Firebase Console > Firestore Database에서:
- `benefits` 컬렉션이 생성되었는지 확인
- 데이터가 추가되는지 확인 (권한 문제가 아니라면 데이터는 추가되지만 읽기만 가능)

### 7. 임시 해결책 (개발용)

개발 중에는 보안 규칙을 임시로 완화할 수 있습니다 (⚠️ 프로덕션에서는 사용 금지):

```javascript
match /benefits/{benefitId} {
  allow read, write: if request.auth != null;  // 로그인한 사용자 모두 가능
}
```

개발 완료 후 반드시 원래 규칙으로 복구하세요!

## 여전히 문제가 있다면

1. 브라우저 콘솔의 전체 에러 메시지 확인
2. Firebase Console > Firestore Database > 규칙 탭에서 "테스트 시뮬레이터" 사용
3. 네트워크 탭에서 실패한 요청 확인


