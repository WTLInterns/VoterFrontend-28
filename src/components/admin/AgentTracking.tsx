import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { Card, Button, Input } from '../ui';
import { MapPin, Search, Users, Wifi, WifiOff, Battery, Zap, ZapOff } from 'lucide-react';
import webSocketService, { AgentLocationUpdate, ConnectionStatusUpdate } from '../../services/WebSocketService';
import GoogleMap from '../common/GoogleMap';
import { useLanguage } from '../../contexts/LanguageContext';

interface AgentLocation {
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

interface LocationStats {
  onlineAgents: number;
  offlineAgents: number;
  totalAgents: number;
}

const AgentTracking: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  
  const [agents, setAgents] = useState<AgentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LocationStats>({ onlineAgents: 0, offlineAgents: 0, totalAgents: 0 });
  const [, setSelectedAgent] = useState<AgentLocation | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Map view state
  const [mapView, setMapView] = useState<'overview' | 'agent-detail'>('overview');
  const [focusedAgent, setFocusedAgent] = useState<AgentLocation | null>(null);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  // Agent list search state
  const [agentListSearchTerm, setAgentListSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  // Production-ready configurations
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const UPDATE_INTERVAL = 30000; // 30 seconds for production

  // Load agent locations with retry logic
  const loadAgentLocations = async (isRetryAttempt = false) => {
    try {
      if (!isRetryAttempt) {
        setLoading(true);
        setRetryCount(0);
      } else {
        setIsRetrying(true);
      }

      // Determine endpoint based on user role
      const endpoint = user?.role === 'master'
        ? '/api/location/all'
        : '/api/location/my-agents';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`https://api.expengo.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (response.ok && result.success) {
        setAgents(result.data || []);
        setRetryCount(0); // Reset retry count on success
        setLastUpdateTime(new Date());
      } else {
        throw new Error(result.message || 'Failed to load agent locations');
      }
    } catch (error: any) {
      console.error('Error loading agent locations:', error);

      // Implement retry logic for production
      if (retryCount < MAX_RETRY_ATTEMPTS && error.name !== 'AbortError') {
        console.log(`Retrying... Attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
        setRetryCount(prev => prev + 1);

        setTimeout(() => {
          loadAgentLocations(true);
        }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      } else {
        // Show error only after all retries failed
        const errorMessage = error.name === 'AbortError'
          ? 'Request timed out. Please check your connection.'
          : error.message || 'Failed to load agent locations';

        showError('Connection Error', errorMessage);
        setAgents([]);
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Load location statistics
  const loadLocationStats = async () => {
    try {
      const endpoint = user?.role === 'master'
        ? '/api/location/stats'
        : '/api/location/stats/my-agents';

      const response = await fetch(`https://api.expengo.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setStats(result.data);
      } else {
        console.warn('Failed to load location stats:', result.message || 'Unknown error');
        // Don't show error toast for stats failures as they're not critical
      }
    } catch (error: any) {
      console.error('Error loading location stats:', error);
      // Don't show error toast for stats failures as they're not critical
    }
  };



  // Handle real-time location updates
  const handleLocationUpdate = (update: AgentLocationUpdate) => {
    setAgents(prevAgents => {
      const currentTime = new Date().toISOString();
      const updatedAgents = prevAgents.map(agent =>
        agent.agentId === update.agentId
          ? { ...agent, ...update, lastUpdate: currentTime } // Set current time for real-time updates
          : agent
      );

      // If agent not found, add it
      if (!updatedAgents.find(agent => agent.agentId === update.agentId)) {
        updatedAgents.push({ ...update, lastUpdate: currentTime });
      }

      return updatedAgents;
    });

    setLastUpdateTime(new Date());
    // Note: Stats will be updated by periodic refresh, not on every location update
  };

  // Handle connection status updates
  const handleStatusUpdate = (update: ConnectionStatusUpdate) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.agentId === update.agentId
          ? {
              ...agent,
              connectionStatus: update.status,
              isOnline: update.status === 'ONLINE',
              lastUpdate: new Date().toISOString() // Update timestamp for status changes too
            }
          : agent
      )
    );

    // Note: Stats will be updated by periodic refresh, not on every status update
  };

  // Handle WebSocket connection changes
  const handleConnectionChange = (connected: boolean) => {
    setWsConnected(connected);
    if (connected) {
      showSuccess('Real-time tracking connected');
    } else {
      showError('Real-time tracking disconnected');
    }
  };

  // Load data on component mount and set up WebSocket
  useEffect(() => {
    loadAgentLocations();
    loadLocationStats();

    // Set up WebSocket connection
    webSocketService.connect();

    // Set up WebSocket event listeners
    const unsubscribeLocation = webSocketService.onLocationUpdate(handleLocationUpdate);
    const unsubscribeStatus = webSocketService.onStatusUpdate(handleStatusUpdate);
    const unsubscribeConnection = webSocketService.onConnectionChange(handleConnectionChange);

    // Set initial connection status
    setWsConnected(webSocketService.isWebSocketConnected());

    // Set up periodic refresh as fallback (production-ready interval)
    const interval = setInterval(() => {
      if (!wsConnected) {
        loadAgentLocations();
        loadLocationStats();
      }
    }, UPDATE_INTERVAL); // Use production-ready interval

    // Set up periodic stats refresh (less frequent than location updates)
    const statsInterval = setInterval(() => {
      loadLocationStats();
    }, UPDATE_INTERVAL * 2); // Refresh stats every 60 seconds

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
      unsubscribeLocation();
      unsubscribeStatus();
      unsubscribeConnection();
      webSocketService.disconnect();
    };
  }, []);

  // Get connection status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-green-600 bg-green-100';
      case 'OFFLINE': return 'text-yellow-600 bg-yellow-100';
      case 'DISCONNECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      // For real-time updates (within 10 seconds), always show "Just now"
      if (diffSeconds < 10) return 'Just now';

      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Unknown';
    }
  };

  // Handle agent name click - redirect to agent location on map
  const handleAgentNameClick = (agent: AgentLocation) => {
    setFocusedAgent(agent);
    setMapView('agent-detail');
    setSelectedAgent(agent);
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setMapView('overview');
    setFocusedAgent(null);
    setSelectedAgent(null);
    setAgentSearchTerm('');
  };

  // Filter agents for search in agent detail view
  const filteredAgentsForSearch = useMemo(() => {
    if (mapView !== 'agent-detail' || !agentSearchTerm.trim()) return agents;

    return agents.filter(agent =>
      `${agent.agentFirstName} ${agent.agentLastName}`.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
      agent.agentMobile.includes(agentSearchTerm) ||
      agent.lastLocation?.toLowerCase().includes(agentSearchTerm.toLowerCase())
    );
  }, [agents, agentSearchTerm, mapView]);

  // Filter agents for the agent list section
  const filteredAgentsForList = useMemo(() => {
    let filtered = agents;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(agent => {
        if (statusFilter === 'ONLINE') return agent.isOnline;
        if (statusFilter === 'OFFLINE') return !agent.isOnline;
        return true;
      });
    }

    // Apply search filter
    if (agentListSearchTerm.trim()) {
      filtered = filtered.filter(agent =>
        `${agent.agentFirstName} ${agent.agentLastName}`.toLowerCase().includes(agentListSearchTerm.toLowerCase()) ||
        agent.agentMobile.includes(agentListSearchTerm) ||
        agent.lastLocation?.toLowerCase().includes(agentListSearchTerm.toLowerCase()) ||
        agent.connectionStatus.toLowerCase().includes(agentListSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [agents, agentListSearchTerm, statusFilter]);

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Tracking
            </h2>
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <ZapOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time location tracking of field agents
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isRetrying && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-600">
                Retrying... ({retryCount}/{MAX_RETRY_ATTEMPTS})
              </span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => webSocketService.connect()}
            disabled={wsConnected}
          >
            {wsConnected ? 'Connected' : 'Connect'}
          </Button>

          <Button
            onClick={loadAgentLocations}
            disabled={loading || isRetrying}
            variant="outline"
          >
            {loading || isRetrying ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onlineAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <WifiOff className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.offlineAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAgents}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Detail Search - Only shown when viewing specific agent */}
      {mapView === 'agent-detail' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={handleBackToOverview}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Back to Overview</span>
            </Button>
            <div className="flex-1 max-w-md ml-4">
              <Input
                type="text"
                placeholder="Search agents..."
                value={agentSearchTerm}
                onChange={setAgentSearchTerm}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
          {focusedAgent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Focused on: {focusedAgent.agentFirstName} {focusedAgent.agentLastName}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {focusedAgent.agentMobile} • {focusedAgent.lastLocation}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Interactive Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.sections.agentLocationsMap}
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">{t.common.online}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">{t.common.offline}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">{t.sections.disconnected}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <GoogleMap
            agents={(mapView === 'agent-detail' ? filteredAgentsForSearch : agents).map(agent => ({
              agentId: agent.agentId,
              agentFirstName: agent.agentFirstName,
              agentLastName: agent.agentLastName,
              agentMobile: agent.agentMobile,
              latitude: agent.latitude,
              longitude: agent.longitude,
              connectionStatus: agent.connectionStatus,
              lastUpdate: agent.lastUpdate,
              batteryLevel: agent.batteryLevel,
              isOnline: agent.isOnline
            }))}
            onAgentClick={(agent) => {
              const fullAgent = agents.find(a => a.agentId === agent.agentId);
              if (fullAgent) {
                handleAgentNameClick(fullAgent);
              }
            }}
            height="500px"
            enableSmoothMovement={true}
            autoFitBounds={mapView === 'overview'}
            preserveZoom={mapView === 'agent-detail'}
            center={focusedAgent ? { lat: focusedAgent.latitude, lng: focusedAgent.longitude } : undefined}
            zoom={focusedAgent ? 15 : 10}
          />
        </div>


      </Card>

      {/* Agent List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agent Locations ({filteredAgentsForList.length}{agentListSearchTerm ? ` of ${agents.length}` : ''})
          </h3>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-4 space-y-3">
          {/* Search Input */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search agents by name, mobile, location, or status..."
                value={agentListSearchTerm}
                onChange={setAgentListSearchTerm}
                icon={<Search className="w-4 h-4" />}
                className="w-full"
              />
            </div>
            {(agentListSearchTerm || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAgentListSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="px-3"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter by status:</span>
            <div className="flex space-x-1">
              <Button
                variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className="text-xs"
              >
                All ({agents.length})
              </Button>
              <Button
                variant={statusFilter === 'ONLINE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ONLINE')}
                className="text-xs flex items-center space-x-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online ({agents.filter(a => a.isOnline).length})</span>
              </Button>
              <Button
                variant={statusFilter === 'OFFLINE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('OFFLINE')}
                className="text-xs flex items-center space-x-1"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Offline ({agents.filter(a => !a.isOnline).length})</span>
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {(agentListSearchTerm || statusFilter !== 'ALL') && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredAgentsForList.length} of {agents.length} agents
              {agentListSearchTerm && ` matching "${agentListSearchTerm}"`}
              {statusFilter !== 'ALL' && ` (${statusFilter.toLowerCase()} only)`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t.sections.loadingAgentLocations}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t.sections.noAgentsSharing}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{t.sections.agentsWillAppear}</p>
          </div>
        ) : filteredAgentsForList.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No agents found matching "{agentListSearchTerm}"</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgentsForList.map((agent) => (
              <div
                key={agent.agentId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${agent.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h4
                      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
                      onClick={() => handleAgentNameClick(agent)}
                      title="Click to view on map"
                    >
                      {highlightSearchTerm(`${agent.agentFirstName} ${agent.agentLastName}`, agentListSearchTerm)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {highlightSearchTerm(agent.agentMobile, agentListSearchTerm)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {highlightSearchTerm(agent.lastLocation || '', agentListSearchTerm)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.connectionStatus)}`}>
                      {agent.connectionStatus}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatLastUpdate(agent.lastUpdate)}
                    </p>
                  </div>

                  {agent.batteryLevel !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Battery className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.batteryLevel}%
                      </span>
                    </div>
                  )}

                  <MapPin
                    className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                    onClick={() => handleAgentNameClick(agent)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AgentTracking;
