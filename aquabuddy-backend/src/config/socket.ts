import { Server as HttpServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import { getAllowedOrigins } from '../middleware/cors';

export const createSocketServer = (httpServer: HttpServer): Server => {
  const options: Partial<ServerOptions> = {
    cors: {
      origin: getAllowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  };

  const io = new Server(httpServer, options);

  return io;
};
