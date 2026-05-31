import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig 의 "@/*" 경로 별칭을 Vitest 런타임에서도 해석하도록 매핑합니다.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // 순수 계산 로직 단위 테스트. jsdom 없이 node 환경으로 충분합니다.
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
