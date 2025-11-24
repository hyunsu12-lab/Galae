# 이미지 폴더

이 폴더에 프로젝트에서 사용할 이미지 파일을 넣으세요.

## 사용 방법

### 1. 로고 이미지 추가

1. 로고 이미지 파일을 이 폴더에 넣으세요 (예: `logo.png`, `logo.svg`)
2. `src/config/images.ts` 파일을 열어서 경로를 수정하세요:

```typescript
export const IMAGES = {
  logo: '/images/logo.png', // 여기에 파일명을 맞춰주세요
} as const;
```

### 2. 지원하는 이미지 형식

- PNG (권장)
- SVG (벡터 이미지, 확대해도 깨지지 않음)
- JPG/JPEG
- WebP

### 3. 권장 사항

- 로고 이미지 크기: 최소 200x200px (고해상도 디스플레이 대응)
- 파일 크기: 100KB 이하 권장
- 투명 배경: PNG 또는 SVG 사용 권장

### 4. 다른 이미지 추가

다른 이미지도 이 폴더에 넣고 `src/config/images.ts`에 경로를 추가할 수 있습니다:

```typescript
export const IMAGES = {
  logo: '/images/logo.png',
  placeholder: '/images/placeholder.png',
  // 추가 이미지들...
} as const;
```

## 현재 구조

```
public/
  images/
    logo.png (여기에 로고 이미지를 넣으세요)
    favicon.png (브라우저 탭 아이콘)
    README.md (이 파일)
```

## 참고

- `public` 폴더의 파일은 빌드 시 그대로 복사됩니다
- 경로는 `/images/파일명` 형식으로 접근합니다
- 이미지가 없으면 텍스트 "Galae"만 표시됩니다

