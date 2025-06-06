import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';
import { AlertTriangle, Database, RefreshCw, Check, X, MapPin, Eye, Trash2, Loader2 } from 'lucide-react';

interface DebugPanelProps {
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [envVars, setEnvVars] = useState<{[key: string]: string}>({});
  const [markerStats, setMarkerStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [isDryRun, setIsDryRun] = useState(true);

  useEffect(() => {
    checkConfiguration();
    testConnection();
    getEnvironmentVariables();
  }, []);

  const checkConfiguration = () => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    addLog(`Supabase configuration check: ${configured ? 'Configured' : 'Not configured'}`);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      addLog('Testing Supabase connection...');
      const connected = await testSupabaseConnection();
      setIsConnected(connected);
      addLog(`Supabase connection test result: ${connected ? 'Connected' : 'Failed'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Connection error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentVariables = () => {
    const vars: {[key: string]: string} = {};
    
    // Get all environment variables that start with VITE_
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        const value = import.meta.env[key];
        if (key.includes('KEY') || key.includes('SECRET')) {
          // Mask sensitive values
          vars[key] = value ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : 'undefined';
        } else {
          vars[key] = value || 'undefined';
        }
      }
    });
    
    setEnvVars(vars);
  };

  const fetchMarkerStats = async () => {
    try {
      setIsLoadingStats(true);
      addLog('Fetching marker statistics...');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/debug-markers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch marker stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMarkerStats(data);
      addLog(`Successfully retrieved marker statistics. Found ${data.recentMarkers?.length || 0} recent markers.`);
      
      // Log category counts
      if (data.categoryCounts) {
        data.categoryCounts.forEach((category: any) => {
          addLog(`Category ${category.category}: ${category.total_count} total, ${category.active_count} active, ${category.last_24h_count} in last 24h`);
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Error fetching marker stats: ${errorMessage}`);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const cleanupMarkers = async (dryRun = true) => {
    try {
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);
      addLog(`Starting marker cleanup (${dryRun ? 'dry run' : 'actual delete'})...`);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-markers`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          days: 1, // Delete markers older than 1 day
          limit: 100, // Limit to 100 markers per operation
          dryRun: dryRun // Whether to actually delete or just simulate
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cleanup markers: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDeleteResult(result);
      
      if (dryRun) {
        addLog(`Dry run completed. Would delete ${result.markers.length} markers.`);
      } else {
        addLog(`Deleted ${result.deletedMarkers.length} markers.`);
      }
      
      // Refresh marker stats after deletion
      if (!dryRun) {
        await fetchMarkerStats();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Error during marker cleanup: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const testQuery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      addLog('Executing test query...');
      const { data: markers, error: markerError } = await supabase
        .from('pin-markers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      if (markerError) throw markerError;
      addLog(`Query successful. Received ${markers?.length || 0} marker records.`);
      
      if (markers && markers.length > 0) {
        markers.forEach(marker => {
          addLog(`Marker: id=${marker.id}, category=${marker.category}, lat=${marker.latitude}, lng=${marker.longitude}, active=${marker.active}, created=${new Date(marker.created_at).toLocaleString()}`);
        });
      } else {
        addLog('No markers found in database.');
      }
      
      // Also check for recent marker confirmations
      const { data: confirmData, error: confirmError } = await supabase
        .from('marker_confirmations')
        .select('*')
        .order('confirmed_at', { ascending: false })
        .limit(5);
        
      if (confirmError) {
        addLog(`Error fetching confirmations: ${confirmError.message}`);
      } else {
        addLog(`Found ${confirmData?.length || 0} recent marker confirmations.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Query error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Database className="mr-2" size={20} />
            Supabase Connection Debugger
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Connection Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Configuration:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${isConfigured ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {isConfigured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Connection:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${isConnected ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={testConnection}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                  >
                    {isLoading ? (
                      <RefreshCw size={16} className="mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw size={16} className="mr-1.5" />
                    )}
                    Test Connection
                  </button>
                  
                  <button
                    onClick={testQuery}
                    disabled={isLoading || !isConnected}
                    className={`px-3 py-1.5 text-white rounded text-sm flex items-center ${
                      isLoading || !isConnected ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <Database size={16} className="mr-1.5" />
                    Test Query
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Environment Variables</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-blue-400 font-mono">{key}</span>
                      <span className="text-gray-300 font-mono break-all">{value}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={fetchMarkerStats}
                  disabled={isLoadingStats || !isConnected}
                  className={`px-3 py-1.5 text-white rounded text-sm flex items-center ${
                    isLoadingStats || !isConnected ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <MapPin size={16} className="mr-1.5" />
                  {isLoadingStats ? 'Loading Stats...' : 'Marker Stats'}
                </button>
                
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-white mb-2">Marker Cleanup</h4>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="dryRunToggle"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="dryRunToggle" className="text-gray-300 text-sm">Dry Run (simulate only)</label>
                  </div>
                  <button
                    onClick={() => cleanupMarkers(isDryRun)}
                    disabled={isDeleting || !isConnected}
                    className={`px-3 py-1.5 text-white rounded text-sm flex items-center ${
                      isDeleting || !isConnected ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="mr-1.5 animate-spin" />
                    ) : (
                      <Trash2 size={16} className="mr-1.5" />
                    )}
                    {isDeleting ? 'Processing...' : isDryRun ? 'Simulate Cleanup' : 'Delete Old Markers'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Debug Logs</h3>
              <div className="bg-black/50 rounded p-3 h-[300px] overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1">{log}</div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500 italic">No logs yet</div>
                )}
              </div>
            </div>
          </div>

          {deleteResult && (
            <div className="bg-gray-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Trash2 size={18} className="mr-2" />
                Marker Cleanup Results
              </h3>
              
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-sm text-gray-300 mb-2">
                  {deleteResult.message}
                </div>
                
                {deleteResult.dryRun ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-medium text-yellow-300">Markers that would be deleted:</h4>
                    {deleteResult.markers?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {deleteResult.markers.map((marker: any, index: number) => (
                          <div key={index} className="text-xs bg-gray-800/50 p-2 rounded">
                            <div className="flex justify-between">
                              <span className="text-gray-400 capitalize">{marker.category}</span>
                              <span className="text-gray-500">{new Date(marker.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-500">
                              ID: {marker.id.substring(0, 8)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-2">No markers found to delete</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-300">Successfully deleted markers:</h4>
                    {deleteResult.deletedMarkers?.length > 0 ? (
                      <div className="text-center text-green-400 font-medium">
                        {deleteResult.deletedMarkers.length} markers have been permanently deleted
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-2">No markers were deleted</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {markerStats && (
            <div className="bg-gray-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Eye size={18} className="mr-2" />
                Marker Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Category Counts</h4>
                  <div className="space-y-2">
                    {markerStats.categoryCounts?.map((category: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{category.category}</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">
                            Total: {category.total_count}
                          </span>
                          <span className="px-2 py-0.5 bg-green-900/50 text-green-300 rounded text-xs">
                            Active: {category.active_count}
                          </span>
                          <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded text-xs">
                            Last 24h: {category.last_24h_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Markers</h4>
                  {markerStats.recentMarkers?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {markerStats.recentMarkers.slice(0, 5).map((marker: any, index: number) => (
                        <div key={index} className="text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span className="capitalize">{marker.category}</span>
                            <span>{new Date(marker.created_at).toLocaleString()}</span>
                          </div>
                          <div className="text-gray-500">
                            ID: {marker.id.substring(0, 8)}... | Active: {marker.active ? 'Yes' : 'No'}
                          </div>
                        </div>
                      ))}
                      {markerStats.recentMarkers.length > 5 && (
                        <div className="text-center text-gray-500 text-xs">
                          + {markerStats.recentMarkers.length - 5} more recent markers
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-2">No recent markers found</div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 text-right">
                Last updated: {new Date(markerStats.timestamp).toLocaleString()}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-200 flex items-start">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-between">
          <div className="text-sm text-gray-400">
            {isConfigured && isConnected ? (
              <span className="flex items-center text-green-400">
                <Check size={16} className="mr-1.5" />
                Connection is working properly
              </span>
            ) : (
              <span className="flex items-center text-yellow-400">
                <AlertTriangle size={16} className="mr-1.5" />
                Connection issues detected
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;