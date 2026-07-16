import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Set<(event: string, data: any) => void> = new Set();

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    this.socket = io(socketUrl, {
      withCredentials: true, // Send cookies with WebSocket connection handshake
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    // Register wild/general event mappings to listener dispatchers
    this.socket.on('sensor:update', (data) => this.dispatch('sensor:update', data));
    this.socket.on('alert:new', (data) => this.dispatch('alert:new', data));
    this.socket.on('alerts:new', (data) => this.dispatch('alerts:new', data));
    this.socket.on('robot:status_change', (data) => this.dispatch('robot:status_change', data));
    this.socket.on('notification:new', (data) => this.dispatch('notification:new', data));
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public subscribeToRobot(robotId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('robot:subscribe', robotId);
    }
  }

  public unsubscribeFromRobot(robotId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('robot:unsubscribe', robotId);
    }
  }

  public subscribeToDashboard(): void {
    if (this.socket?.connected) {
      this.socket.emit('dashboard:subscribe');
    }
  }

  public subscribeToAlerts(): void {
    if (this.socket?.connected) {
      this.socket.emit('alerts:subscribe');
    }
  }

  public addEventListener(listener: (event: string, data: any) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private dispatch(event: string, data: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Error dispatching WebSocket event:', err);
      }
    });
  }
}

export const webSocketService = new WebSocketService();
