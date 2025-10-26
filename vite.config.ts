import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all environment variables from .env files based on the current mode.
  // The third argument '' ensures all variables are loaded, not just VITE_ prefixed ones.
  // Fix: Use `cwd()` from the `process` module to avoid a TypeScript type error with the global `process` object.
  const env = loadEnv(mode, cwd(), '');

  return {
    plugins: [react()],
    // The define option performs a direct text replacement of global variables at build time.
    // This replaces any occurrence of `process.env` in the code with a stringified object of our environment variables.
    // This is a more robust method than `import.meta.env` for some non-standard environments.
    define: {
      'process.env': JSON.stringify(env)
    }
  };
});