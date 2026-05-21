import type { 
  GridStatus, 
  WeatherData, 
  Prediction, 
  Alert, 
  ModelMetrics, 
  FeatureImportance,
  HistoricalOutage,
  GridParameter,
  User
} from '@/types/dashboard';

export const currentGridStatus: GridStatus = {
  voltage: 230.5,
  current: 45.2,
  frequency: 50.02,
  powerFactor: 0.95,
  load: 68.5,
  status: 'normal',
  timestamp: new Date().toISOString()
};

export const currentWeather: WeatherData = {
  temperature: 34.5,
  temperatureDeviation: 2.8,
  humidity: 78,
  windSpeed: 12.5,
  windGusts: 18.2,
  precipitation: 0.0,
  weatherRiskScore: 65,
  timestamp: new Date().toISOString()
};

export const predictions: Prediction[] = [
  {
    id: 'pred-001',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    probability: 0.72,
    riskLevel: 'high',
    confidence: 0.85,
    estimatedTimeToOutage: 2.5,
    affectedArea: 'Lagos Central',
    features: { temp_deviation: 2.8, humidity: 78, wind_speed: 12.5,
      voltage_level: 230.5,grid_load: 68.5,frequency_dev: 0.02
    }
  },
  {
    id: 'pred-002',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    probability: 0.45,
    riskLevel: 'moderate',
    confidence: 0.78,
    estimatedTimeToOutage: 4.0,
    affectedArea: 'Abuja North',
    features: { temp_deviation: 1.5, humidity: 65, wind_speed: 8.2 }
  },
  {
    id: 'pred-003',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    probability: 0.23,
    riskLevel: 'low',
    confidence: 0.82,
    estimatedTimeToOutage: 6.0,
    affectedArea: 'Port Harcourt',
    features: { temp_deviation: 0.5, humidity: 55, wind_speed: 5.0 }
  },
  {
    id: 'pred-004',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    probability: 0.10,
    riskLevel: 'critical',
    confidence: 0.91,
    estimatedTimeToOutage: 1.5,
    affectedArea: 'Kano East',
    features: { temp_deviation: 4.2, humidity: 85, wind_speed: 22.0 }
  },
  {
    id: 'pred-005',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    probability: 0.38,
    riskLevel: 'moderate',
    confidence: 0.75,
    estimatedTimeToOutage: 5.0,
    affectedArea: 'Ibadan West',
    features: { temp_deviation: 1.2, humidity: 60, wind_speed: 7.5 }
  }
];

export const alerts: Alert[] = [
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

export const modelMetrics: ModelMetrics = {
  accuracy: 0.75,
  precision: 0.62,
  recall: 0.65,
  f1Score: 0.63,
  rocAuc: 0.787,
  confusionMatrix: [
    [42500, 8500],
    [12000, 23200]
  ]
};

export const featureImportance: FeatureImportance[] = [
  { feature: 'Temperature Deviation', importance: 0.358, category: 'weather' },
  { feature: 'Skin Temperature', importance: 0.186, category: 'weather' },
  { feature: 'Discomfort Index', importance: 0.142, category: 'risk' },
  { feature: 'Heat Stress', importance: 0.098, category: 'risk' },
  { feature: 'Humidity', importance: 0.076, category: 'weather' },
  { feature: 'Wind Speed', importance: 0.054, category: 'weather' },
  { feature: 'Peak Hour Risk', importance: 0.042, category: 'temporal' },
  { feature: 'Weather Risk Score', importance: 0.028, category: 'risk' },
  { feature: 'Hour of Day', importance: 0.008, category: 'temporal' },
  { feature: 'Day of Week', importance: 0.004, category: 'temporal' },
  { feature: 'Voltage Level', importance: 0.002, category: 'grid' },
  { feature: 'Load Factor', importance: 0.0015, category: 'grid' },
  { feature: 'Frequency Deviation', importance: 0.0008, category: 'grid' },
  { feature: 'Power Factor', importance: 0.0005, category: 'grid' },
  { feature: 'Season', importance: 0.0002, category: 'temporal' }
];

export const gridParameters: GridParameter[] = [
  { 
    name: 'Voltage L1', 
    value: 230.5, 
    unit: 'V', 
    min: 200, 
    max: 260, 
    normal: [220, 240], 
    trend: 'stable' 
  },
  { 
    name: 'Voltage L2', 
    value: 229.8, 
    unit: 'V', 
    min: 200, 
    max: 260, 
    normal: [220, 240], 
    trend: 'down' 
  },
  { 
    name: 'Voltage L3', 
    value: 231.2, 
    unit: 'V', 
    min: 200, 
    max: 260, 
    normal: [220, 240], 
    trend: 'up' 
  },
  { 
    name: 'Current L1', 
    value: 45.2, 
    unit: 'A', 
    min: 0, 
    max: 100, 
    normal: [20, 60], 
    trend: 'up' 
  },
  { 
    name: 'Current L2', 
    value: 42.8, 
    unit: 'A', 
    min: 0, 
    max: 100, 
    normal: [20, 60], 
    trend: 'stable' 
  },
  { 
    name: 'Current L3', 
    value: 44.5, 
    unit: 'A', 
    min: 0, 
    max: 100, 
    normal: [20, 60], 
    trend: 'stable' 
  },
  { 
    name: 'Frequency', 
    value: 50.02, 
    unit: 'Hz', 
    min: 49.5, 
    max: 50.5, 
    normal: [49.8, 50.2], 
    trend: 'stable' 
  },
  { 
    name: 'Power Factor', 
    value: 0.95, 
    unit: '', 
    min: 0.8, 
    max: 1.0, 
    normal: [0.9, 1.0], 
    trend: 'up' 
  }
];

export const historicalOutages: HistoricalOutage[] = Array.from({ length: 168 }, (_, i) => {
  const hour = new Date();
  hour.setHours(hour.getHours() - i);
  const prob = Math.random();
  return {
    timestamp: hour.toISOString(),
    occurred: prob > 0.7,
    predicted: prob > 0.65,
    probability: prob
  };
}).reverse();

export const users: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@powergrid.ng', role: 'admin', lastActive: new Date().toISOString() },
  { id: 'u2', name: 'Operator John', email: 'john@powergrid.ng', role: 'operator', lastActive: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'u3', name: 'Operator Sarah', email: 'sarah@powergrid.ng', role: 'operator', lastActive: new Date(Date.now() - 120 * 60000).toISOString() },
  { id: 'u4', name: 'Viewer Mike', email: 'mike@powergrid.ng', role: 'viewer', lastActive: new Date(Date.now() - 360 * 60000).toISOString() }
];

// Generate hourly weather data for the last 24 hours
export const weatherHistory = Array.from({ length: 24 }, (_, i) => {
  const hour = new Date();
  hour.setHours(hour.getHours() - (23 - i));
  return {
    timestamp: hour.toISOString(),
    temperature: 30 + Math.random() * 8,
    humidity: 60 + Math.random() * 25,
    windSpeed: 5 + Math.random() * 15,
    weatherRiskScore: 30 + Math.random() * 50
  };
});

// Generate voltage history for charts
export const voltageHistory = Array.from({ length: 60 }, (_, i) => {
  const minute = new Date();
  minute.setMinutes(minute.getMinutes() - (59 - i));
  return {
    timestamp: minute.toISOString(),
    l1: 228 + Math.random() * 6,
    l2: 227 + Math.random() * 6,
    l3: 229 + Math.random() * 6
  };
});

// Model comparison data
export const modelComparison = [
  { name: 'Random Forest', accuracy: 0.72, precision: 0.58, recall: 0.61, f1: 0.59 },
  { name: 'Gradient Boosting', accuracy: 0.73, precision: 0.60, recall: 0.63, f1: 0.61 },
  { name: 'Ensemble', accuracy: 0.75, precision: 0.62, recall: 0.65, f1: 0.63 }
];

// Outage distribution data
export const outageDistribution = [
  { name: 'No Outage', value: 68119, color: '#22c55e' },
  { name: 'Outage', value: 35326, color: '#ef4444' }
];

// Hourly outage pattern
export const hourlyOutagePattern = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  outages: Math.floor(Math.random() * 50) + (i >= 18 && i <= 22 ? 30 : 0),
  predictions: Math.floor(Math.random() * 45) + (i >= 18 && i <= 22 ? 25 : 0)
}));
