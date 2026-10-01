import { io, Socket } from 'socket.io-client';
import { tokenManager } from './client';
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.220.41';
const PROD_SOCKET_URL = 'https://shaddad-api.onrender.com';
const SOCKET_URL = __DEV__ 
  ? Platform.select({
      android: `http://${LOCAL_IP}:5000`,
      ios: `http://${LOCAL_IP}:5000`,
      default: 'http://localhost:5000',
    }) 
  : PROD_SOCKET_URL;

class SocketClient {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => console.log('Socket connected:', this.socket?.id));
    this.socket.on('disconnect', () => console.log('Socket disconnected'));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTrip(tripId: string) {
    if (!this.socket?.connected) this.connect();
    this.socket?.emit('join_trip', { tripId });
  }

  sendLocation(tripId: string, lat: number, lng: number) {
    this.socket?.emit('driver_location_update', { tripId, lat, lng });
  }

  onLocationUpdate(callback: (data: { lat: number; lng: number; timestamp: string }) => void) {
    this.socket?.on('driver_location_updated', callback);
  }
  
  offLocationUpdate() {
    this.socket?.off('driver_location_updated');
  }

  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification', callback);
  }

  offNotification() {
    this.socket?.off('notification');
  }

  onTripCanceled(callback: (data: { tripId: string, reason: string }) => void) {
    this.socket?.on('trip_canceled', callback);
  }

  offTripCanceled() {
    this.socket?.off('trip_canceled');
  }
}

export const socketClient = new SocketClient();


