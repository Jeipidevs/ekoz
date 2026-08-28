import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? window.location.origin
    : 'http://localhost:3001');

class SocketClient {
  private socket: Socket | null = null;

  public connect(token?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('ekoz_token') || '',
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ [Socket.IO Frontend] Connected to Ekoz real-time network');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket.IO Frontend] Disconnected:', reason);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public sendMessage(recipientId: string, text: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:send_message', { recipientId, text });
    }
  }
}

export const socketClient = new SocketClient();
