let IS_PROD = true;

const server = IS_PROD
  ? "https://videocalling-backend-s5ek.onrender.com"
  : "http://localhost:8080";

export default server;