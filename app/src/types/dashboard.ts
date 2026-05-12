export interface GridStatus {
  voltage: number;
  current: number;
  frequency: number;
  powerFactor: number;
  load: number;
  status: 'normal' | 'caution' | 'warning' | 'critical';
  timestamp: string;
}

export interface WeatherData {
  temperature: number;
  temperatureDeviation: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  weatherRiskScore: number;
  timestamp: string;
}

export interface Prediction {
  id: string;
  timestamp: string;
  probability: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  estimatedTimeToOutage: number;
  affectedArea?: string;
  features: Record<string, number>;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'prediction' | 'threshold' | 'manual';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  predictionId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  notes?: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: number[][];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'weather' | 'temporal' | 'risk' | 'grid';
}

export interface HistoricalOutage {
  timestamp: string;
  occurred: boolean;
  predicted: boolean;
  probability: number;
}

export interface GridParameter {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  normal: [number, number];
  trend: 'up' | 'down' | 'stable';
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  soundsEnabled:boolean;
  darkMode?: boolean;
  twoFactor?: boolean;
  sessionTimeout?: boolean;
  emailRecipients: string[];
  smsRecipients: string[];
  alertThreshold: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  lastActive: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: string;
  user?: string;
}
