import type { MetadataRoute } from "next";

/**
 * PWA 매니페스트 — 홈 화면 설치 시의 앱 정보.
 * 친구들이 모바일 브라우저에서 "홈 화면에 추가"로 앱처럼 설치할 수 있게 합니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "사주 (四柱)",
    short_name: "사주",
    description: "생년월일시로 사주 명식·오행·십신·대운을 계산하는 만세력 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "ko",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
