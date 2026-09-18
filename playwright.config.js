// The golden playthrough runs against the same static server a reader gets.
// Reduced motion keeps the book transitions instant so the run measures the
// game, not the animation.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test/e2e",
  timeout: 120_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "python3 -m http.server 8080",
    url: "http://localhost:8080/index.html",
    reuseExistingServer: true,
    timeout: 20_000
  }
});
