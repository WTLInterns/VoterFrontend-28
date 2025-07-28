import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface AgentLocationUpdate {
  agentId: string;
  agentFirstName: string;
  agentLastName: string;
  agentMobile: string;
  lastLocation: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  connectionStatus: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED';
  lastUpdate: string;
  batteryLevel?: number;
  isCharging?: boolean;
  isOnline: boolean;
}

export interface ConnectionStatusUpdate {
  agentId: string;
  status: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED';
  timestamp: string;
}

type LocationUpdateCallback = (update: AgentLocationUpdate) => void;
type StatusUpdateCallback = (update: ConnectionStatusUpdate) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  
  private locationUpdateCallbacks: LocationUpdateCallback[] = [];
  private statusUpdateCallbacks: StatusUpdateCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    const token = localStorage.getItem('voter_admin_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('https://api.expengo.com/api/ws/location'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('WebSocket Debug:', str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('WebSocket connected:', frame);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      this.notifyConnectionCallbacks(true);
      this.subscribeToTopics();
    };

    this.client.onDisconnect = (frame) => {
      console.log('WebSocket disconnected:', frame);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
      this.handleReconnect();
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
      this.handleReconnect();
    };

    this.client.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
      this.handleReconnect();
    };
  }

  private subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.error('Cannot subscribe: client not connected');
      return;
    }

    // Subscribe to location updates
    this.client.subscribe('/topic/location/updates', (message) => {
      try {
        const locationUpdate: AgentLocationUpdate = JSON.parse(message.body);
        console.log('Received location update:', locationUpdate);
        this.notifyLocationUpdateCallbacks(locationUpdate);
      } catch (error) {
        console.error('Error parsing location update:', error);
      }
    });

    // Subscribe to status updates
    this.client.subscribe('/topic/location/status', (message) => {
      try {
        const statusUpdate: ConnectionStatusUpdate = JSON.parse(message.body);
        console.log('Received status update:', statusUpdate);
        this.notifyStatusUpdateCallbacks(statusUpdate);
      } catch (error) {
        console.error('Error parsing status update:', error);
      }
    });

    // Subscribe to disconnection events
    this.client.subscribe('/topic/location/disconnection', (message) => {
      try {
        const disconnectionUpdate: AgentLocationUpdate = JSON.parse(message.body);
        console.log('Received disconnection update:', disconnectionUpdate);
        this.notifyLocationUpdateCallbacks(disconnectionUpdate);
      } catch (error) {
        console.error('Error parsing disconnection update:', error);
      }
    });

    console.log('Subscribed to WebSocket topics');
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  public connect(): void {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    if (!this.client) {
      this.setupClient();
    }

    if (this.client) {
      console.log('Connecting to WebSocket...');
      this.client.activate();
    }
  }

  public disconnect(): void {
    if (this.client) {
      console.log('Disconnecting from WebSocket...');
      this.client.deactivate();
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Callback management
  public onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.locationUpdateCallbacks.push(callback);
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  public onStatusUpdate(callback: StatusUpdateCallback): () => void {
    this.statusUpdateCallbacks.push(callback);
    return () => {
      const index = this.statusUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusUpdateCallbacks.splice(index, 1);
      }
    };
  }

  public onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyLocationUpdateCallbacks(update: AgentLocationUpdate) {
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in location update callback:', error);
      }
    });
  }

  private notifyStatusUpdateCallbacks(update: ConnectionStatusUpdate) {
    this.statusUpdateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in status update callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  // Utility method to refresh authentication token
  public refreshToken(): void {
    const token = localStorage.getItem('voter_admin_token');
    if (token && this.client) {
      this.client.connectHeaders = {
        Authorization: `Bearer ${token}`
      };
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
