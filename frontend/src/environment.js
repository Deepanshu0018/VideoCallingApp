let IS_PROD = false; // Change to true for production

// Detect if running in GitHub Codespaces
const isCodespace = window.location.hostname.includes('github.dev');

let server;

if (isCodespace) {
  // In Codespaces, construct the backend URL using the same domain but port 8080
  // e.g., https://workspace-3000.app.github.dev -> https://workspace-8080.app.github.dev
  const originalUrl = window.location.href;
  const baseUrl = window.location.origin.replace('-3000', '-8080');
  server = baseUrl;
} else {
  server = IS_PROD
    ? "https://videocalling-backend-s5ek.onrender.com"
    : "http://localhost:8080";
}

export default server;