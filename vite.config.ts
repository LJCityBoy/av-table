import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src/packages/**/*.{vue,ts}"],
    }),
  ],
  build: {
    minify: true,
    sourcemap: false,
    lib: {
      entry: "./src/packages/index.ts",
      name: "AVTable",
    },
    rollupOptions: {
      //不打包进去的依赖
      external: ["vue", "ant-design-vue"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
