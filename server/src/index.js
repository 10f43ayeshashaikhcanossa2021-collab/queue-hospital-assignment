const http = require('http');
const { Server } = require('socket.io');
const env = require('./config/env');
const { connectDatabase } = require('./config/db');
const { createApp } = require('./app');
const { attachSocketHandlers } = require('./services/socketService');
const { seedSystem } = require('./services/queueService');

async function bootstrap() {
  await connectDatabase();
  await seedSystem();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  attachSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`Queue Cure server listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});