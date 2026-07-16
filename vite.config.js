import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBasePath() {
  if (!process.env.GITHUB_ACTIONS || !process.env.GITHUB_REPOSITORY) {
    return '/';
  }

  const repositoryName = process.env.GITHUB_REPOSITORY.split('/')[1];
  return `/${repositoryName}/`;
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
});
