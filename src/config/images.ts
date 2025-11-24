// 이미지 경로 설정
// public/images 폴더에 이미지를 넣고 여기서 경로를 설정하세요

export const IMAGES = {
  // 로고 이미지 (public/images 폴더 기준)
  logo: '/images/logo.svg', // 기본 로고
  
  // 다른 이미지들도 여기에 추가 가능
  // placeholder: '/images/placeholder.png',
} as const;

// 로고 이미지가 없을 경우 대체할 텍스트 또는 기본 이미지
export const LOGO_FALLBACK = {
  text: 'Galae', // 이미지가 없을 때 표시할 텍스트
  showText: true, // 이미지와 함께 텍스트도 표시할지 여부
} as const;

