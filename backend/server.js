import 'dotenv/config';
import { createServer } from 'node:http';
import app from './app/index.app.js';

const httpServer = createServer(app);

const PORT = process.env.WEB_SERV_PORT || 4000;
const DOMAIN = process.env.WEB_SERV_DOMAIN || 'localhost';

httpServer.listen(PORT, () => {
  console.log(`🚀HTTP Server launched at http://${DOMAIN}:${PORT} 🚀`);
});