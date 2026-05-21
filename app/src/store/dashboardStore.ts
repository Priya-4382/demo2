import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Prediction, 
  Alert, 
  GridStatus, 
  WeatherData,
  NotificationSettings,
  LogEntry, AppNotification
} from '@/types/dashboard';

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial mock data generators
const generateInitialPredictions = (): Prediction[] => [
  {
    id: 'pred-001',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    probability: 0.72,
    riskLevel: 'high',
    confidence: 0.85,
    estimatedTimeToOutage: 2.5,
    affectedArea: 'Lagos Central',
    features: { temp_deviation: 2.8, humidity: 78, wind_speed: 12.5, voltage: 230.5, load: 68.5 }
  },
  {
    id: 'pred-002',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    probability: 0.45,
    riskLevel: 'moderate',
    confidence: 0.78,
    estimatedTimeToOutage: 4.0,
    affectedArea: 'Abuja North',
    features: { temp_deviation: 1.5, humidity: 65, wind_speed: 8.2, voltage: 229.8, load: 62.3 }
  },
  {
    id: 'pred-003',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    probability: 0.23,
    riskLevel: 'low',
    confidence: 0.82,
    estimatedTimeToOutage: 6.0,
    affectedArea: 'Port Harcourt',
    features: { temp_deviation: 0.5, humidity: 55, wind_speed: 5.0, voltage: 231.2, load: 55.1 }
  },
  {
    id: 'pred-004',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    probability: 0.10,
    riskLevel: 'critical',
    confidence: 0.91,
    estimatedTimeToOutage: 1.5,
    affectedArea: 'Kano East',
    features: { temp_deviation: 4.2, humidity: 85, wind_speed: 22.0, voltage: 228.1, load: 88.5 }
  },
  {
    id: 'pred-005',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    probability: 0.38,
    riskLevel: 'moderate',
    confidence: 0.75,
    estimatedTimeToOutage: 5.0,
    affectedArea: 'Ibadan West',
    features: { temp_deviation: 1.2, humidity: 60, wind_speed: 7.5, voltage: 230.2, load: 58.7 }
  }
];

const generateInitialAlerts = (): Alert[] => [
  {
    id: 'alert-001',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'prediction',
    priority: 'high',
    message: 'High outage probability (72%) detected for Lagos Central',
    status: 'pending',
    predictionId: 'pred-001'
  },
  {
    id: 'alert-002',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    type: 'prediction',
    priority: 'critical',
    message: 'Critical outage probability (85%) detected for Kano East',
    status: 'acknowledged',
    predictionId: 'pred-004',
    acknowledgedBy: 'Operator John',
    acknowledgedAt: new Date(Date.now() - 110 * 60000).toISOString(),
    notes: 'Dispatched maintenance team to affected area'
  },
  {
    id: 'alert-003',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    type: 'threshold',
    priority: 'moderate',
    message: 'Voltage fluctuation detected in Abuja North substation',
    status: 'resolved',
    acknowledgedBy: 'Operator Sarah',
    acknowledgedAt: new Date(Date.now() - 230 * 60000).toISOString(),
    notes: 'Voltage stabilized after load balancing'
  },
  {
    id: 'alert-004',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    type: 'prediction',
    priority: 'low',
    message: 'Moderate outage risk in Port Harcourt area',
    status: 'resolved',
    predictionId: 'pred-003'
  },
  {
    id: 'alert-005',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    type: 'manual',
    priority: 'moderate',
    message: 'Scheduled maintenance window starting in 2 hours',
    status: 'acknowledged',
    acknowledgedBy: 'Admin',
    acknowledgedAt: new Date(Date.now() - 25 * 60000).toISOString()
  }
];

const generateInitialLogs = (): LogEntry[] => [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    level: 'info' as const,
    category: 'Prediction',
    message: 'New prediction generated',
    details: 'Probability: 72%, Risk: High, Area: Lagos Central'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    level: 'warning' as const,
    category: 'Grid',
    message: 'Voltage fluctuation detected',
    details: 'Voltage L2 dropped to 218.5V'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    level: 'success' as const,
    category: 'Alert',
    message: 'Alert acknowledged',
    user: 'Operator John',
    details: 'Alert ID: alert-001 - High outage probability'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    level: 'info' as const,
    category: 'System',
    message: 'Weather data updated',
    details: 'Temperature: 34.5°C, Humidity: 78%'
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    level: 'error' as const,
    category: 'API',
    message: 'Weather API connection failed',
    details: 'Retrying in 60 seconds...'
  }
];

export interface DashboardState {
  // Data
  predictions: Prediction[];
  
  alerts: Alert[];
  logs: LogEntry[];
  notifications: AppNotification[];
  pendingAlertsCount: number;
  
  // Settings
  notificationSettings: NotificationSettings;
  alertThreshold: number;
  riskBoundaries: {
    low: number;
    moderate: number;
    high: number;
  };
  
  // Current Status
  gridStatus: GridStatus;
  weather: WeatherData;
  
  // Actions - Predictions
  addPrediction: (prediction: Omit<Prediction, 'id' | 'timestamp'>) => void;
  updatePrediction: (id: string, updates: Partial<Prediction>) => void;
  deletePrediction: (id: string) => void;
  clearOldPredictions: (hours: number) => void;
  
  // Actions - Alerts
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'status'>) => void;
  acknowledgeAlert: (id: string, userId: string, notes?: string) => void;
  resolveAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  
  // Actions - Logs
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  exportLogs: () => string;
  
  // Actions - Settings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateAlertThreshold: (threshold: number) => void;
  updateRiskBoundaries: (boundaries: Partial<DashboardState['riskBoundaries']>) => void;
  
  addNotification: (message: string, type: AppNotification['type']) => void;
  resetAlertCount: () => void;
  clearNotifications: () => void;

  // Actions - Real-time
  updateGridStatus: (status: Partial<GridStatus>) => void;
  updateWeather: (weather: Partial<WeatherData>) => void;
  
  // Computed
  getPredictionsToday: () => number;
  getActiveAlertsCount: () => number;
  getAlertsByStatus: () => { pending: number; acknowledged: number; resolved: number };
  getRiskLevel: (probability: number) => 'low' | 'moderate' | 'high' | 'critical';
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial data
      predictions: generateInitialPredictions(),
      alerts: generateInitialAlerts(),
      logs: generateInitialLogs(),
      notifications: [],
      pendingAlertsCount: 0,

      // Default settings
      notificationSettings: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        soundsEnabled:true,
        emailRecipients: ['admin@powergrid.ng', 'ops@powergrid.ng'],
        smsRecipients: ['+2348012345678'],
        alertThreshold: 70
      },
      alertThreshold: 30,
      riskBoundaries: {
        low: 20,
        moderate: 40,
        high: 50
      },
      
      // Current status
      gridStatus: {
        voltage: 230.5,
        current: 45.2,
        frequency: 50.02,
        powerFactor: 0.95,
        load: 68.5,
        status: 'normal',
        timestamp: new Date().toISOString()
      },
      weather: {
        temperature: 34.5,
        temperatureDeviation: 2.8,
        humidity: 78,
        windSpeed: 12.5,
        windGusts: 18.2,
        precipitation: 0.0,
        weatherRiskScore: 65,
        timestamp: new Date().toISOString()
      },
      
      // Prediction Actions
      addPrediction: (prediction) => {
        const newPrediction: Prediction = {
          ...prediction,
          id: generateId('pred'),
          timestamp: new Date().toISOString()
        };
        set((state) => ({ 
          predictions: [newPrediction, ...state.predictions] 
        }));

        const currentRisk = get().getRiskLevel(prediction.probability);
        if (prediction.probability * 100 >= get().alertThreshold) {
          get().addAlert({
            type: 'prediction',
            priority: currentRisk,
            message: `Outage probability (${(prediction.probability * 100).toFixed(0)}%) detected for ${prediction.affectedArea || 'unknown area'}`,
            predictionId: newPrediction.id
          });
        }
        get().addLog({
          level: currentRisk === 'critical' ? 'error' : currentRisk === 'high' ? 'warning' : currentRisk === 'moderate' ? 'warning' : 'info',
          category: 'Prediction',
          message: 'New prediction generated',
          details: `Probability: ${(prediction.probability * 100).toFixed(0)}%, Risk: ${prediction.riskLevel}`
        });
      },
      
      updatePrediction: (id, updates) => {
        set((state) => ({
          predictions: state.predictions.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },
      
      deletePrediction: (id) => {
        set((state) => ({
          predictions: state.predictions.filter(p => p.id !== id)
        }));
        get().addLog({
          level: 'info',
          category: 'Prediction',
          message: 'Prediction deleted',
          details: `ID: ${id}`
        });
      },
      
      clearOldPredictions: (hours) => {
        const cutoff = Date.now() - hours * 3600000;
        set((state) => ({
          predictions: state.predictions.filter(p => 
            new Date(p.timestamp).getTime() > cutoff
          )
        }));
      },
      
      // Alert Actions
      addAlert: (alert) => {
        const newAlert: Alert = {
          ...alert,
          id: generateId('alert'),
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        set((state) => ({ 
          alerts: [newAlert, ...state.alerts] 
        }));
        get().addNotification(
          alert.message, 
          alert.priority 
        );
        get().addLog({
          level: alert.priority === 'critical' ? 'error' : 
                 (alert.priority === 'high' || alert.priority === 'moderate') ? 'warning' : 'info',
          category: 'Alert',
          message: `New ${alert.priority} alert created`,
          details: alert.message
        });
      },
      
      acknowledgeAlert: (id, userId, notes) => {
        set((state) => ({
          alerts: state.alerts.map(a => 
            a.id === id ? { 
              ...a, 
              status: 'acknowledged', 
              acknowledgedBy: userId,
              acknowledgedAt: new Date().toISOString(),
              notes 
            } : a
          )
        }));
        get().addLog({
          level: 'success',
          category: 'Alert',
          message: 'Alert acknowledged',
          user: userId,
          details: `Alert ID: ${id}`
        });
      },
      
      resolveAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map(a => 
            a.id === id ? { ...a, status: 'resolved' } : a
          )
        }));
        get().addLog({
          level: 'success',
          category: 'Alert',
          message: 'Alert resolved',
          details: `Alert ID: ${id}`
        });
      },
      
      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== id)
        }));
      },
      
      // Log Actions
      addLog: (log) => {
        const newLog = {
          ...log,
          id: generateId('log'),
          timestamp: new Date().toISOString()
        };
        set((state) => ({ 
          logs: [newLog, ...state.logs].slice(0, 1000) // Keep last 1000 logs
        }));
      },
      
      clearLogs: () => {
        set({ logs: [] });
      },
      
      exportLogs: () => {
        return JSON.stringify(get().logs, null, 2);
      },
      
      // Settings Actions
     updateNotificationSettings: (settings) => {
  const currentSettings = get().notificationSettings;
 (Object.keys(settings) as Array<keyof NotificationSettings>).forEach((key) => {
    const oldValue = currentSettings[key];
    const newValue = settings[key];

    if (newValue !== oldValue) {
      const cleanKey = key.replace(/Enabled|Settings/g, '').toLowerCase();

      get().addLog({
        level: 'success',
        category: 'System',
        message: `SETTINGS : ${cleanKey} changed`,
        details: `Updated from ${oldValue} to ${newValue}`
      });
    }
  });

  set((state) => ({
    notificationSettings: { ...state.notificationSettings, ...settings }
  }));
},
      
     updateAlertThreshold: (threshold) => {
  const oldThreshold = get().alertThreshold;
  
  if (threshold !== oldThreshold) {
    set({ alertThreshold: threshold });
    get().addLog({
      level: 'success',
      category: 'System',
      message: ' THRESHOLDS : Alert threshold updated',
      details: `${oldThreshold}% → ${threshold}%`
    });
  }
},

      updateRiskBoundaries: (boundaries) => {
  const current = get().riskBoundaries;
  if (JSON.stringify(boundaries) !== JSON.stringify(current)) {
    get().addLog({
      level: 'success',
      category: 'System',
      message: 'THRESHOLDS : Risk boundaries updated',
      details: `New Config: L:${boundaries.low} M:${boundaries.moderate} H:${boundaries.high}`
    });

    set((state) => ({
      riskBoundaries: { ...state.riskBoundaries, ...boundaries }
    }));
  }
},
      
      // Real-time Actions
      updateGridStatus: (status) => {
        set((state) => ({
          gridStatus: { 
            ...state.gridStatus, 
            ...status, 
            timestamp: new Date().toISOString() 
          }
        }));
      },
      
      updateWeather: (weather) => {
        set((state) => ({
          weather: { 
            ...state.weather, 
            ...weather, 
            timestamp: new Date().toISOString() 
          }
        }));
      },
      
      // Computed
      getPredictionsToday: () => {
        const today = new Date().toDateString();
        return get().predictions.filter(p => 
          new Date(p.timestamp).toDateString() === today
        ).length;
      },
      
      getActiveAlertsCount: () => {
        return get().alerts.filter(a => a.status === 'pending').length;
      },
      
      getAlertsByStatus: () => {
        const alerts = get().alerts;
        return {
          pending: alerts.filter(a => a.status === 'pending').length,
          acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
          resolved: alerts.filter(a => a.status === 'resolved').length
        };
      },
      
      getRiskLevel: (probability) => {
        const pct = probability * 100;
        const { low, moderate, high } = get().riskBoundaries;
        if (pct < low) return 'low';
        if (pct < moderate) return 'moderate';
        if (pct < high) return 'high';
        return 'critical';
      },

      addNotification: (message, type) => {
  const { notificationSettings } = get();
  if (notificationSettings.pushEnabled) {
     set((state) => ({
        notifications: [
          { id: Math.random().toString(36).substr(2, 9), message, type, timestamp: new Date().toISOString() },
          ...state.notifications
        ].slice(0, 50), 
        pendingAlertsCount: state.pendingAlertsCount + 1
      }));
    }},

      resetAlertCount: () => set({ pendingAlertsCount: 0 }),

      clearNotifications: () => set({ notifications: [], pendingAlertsCount: 0 }),
    }),
    
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        predictions: state.predictions,
        alerts: state.alerts,
        logs: state.logs,
        notifications: state.notifications,
        pendingAlertsCount: state.pendingAlertsCount,
        notificationSettings: state.notificationSettings,
        alertThreshold: state.alertThreshold,
        riskBoundaries: state.riskBoundaries
      })
    }
  )
);

// Install zustand
console.log('Zustand store created');
