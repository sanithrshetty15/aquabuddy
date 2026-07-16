import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { webSocketService } from '../services/websocket.service';

/**
 * Hook to manage Socket.IO connection based on user authentication state
 * and expose room subscription actions
 */
export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      webSocketService.connect();
    } else {
      webSocketService.disconnect();
    }
  }, [isAuthenticated]);

  return {
    socket: webSocketService.getSocket(),
    subscribeToRobot: (robotId: string) => webSocketService.subscribeToRobot(robotId),
    unsubscribeFromRobot: (robotId: string) => webSocketService.unsubscribeFromRobot(robotId),
    subscribeToDashboard: () => webSocketService.subscribeToDashboard(),
    subscribeToAlerts: () => webSocketService.subscribeToAlerts(),
    addEventListener: (listener: (event: string, data: any) => void) => 
      webSocketService.addEventListener(listener),
  };
};
