import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 순수 계산 로직 단위 테스트. jsdom 없이 node 환경으로 충분합니다.
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
