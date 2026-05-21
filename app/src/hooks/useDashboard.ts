import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { GridStatus } from '@/types/dashboard';

// Real-time data simulation hook
export function useRealTimeSimulation() {
  const { 
    updateGridStatus, 
    updateWeather, 
    addPrediction,
    getRiskLevel,
    addAlert,
    alertThreshold ,
    notificationSettings
  } = useDashboardStore();
  
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const predictionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
      return;
    }

    // Simulate grid and weather updates every 5 seconds
    intervalRef.current = setInterval(() => {
      // Update grid status with realistic variations
      const voltage = 228 + Math.random() * 6;
      const current = 40 + Math.random() * 12;
      const frequency = 49.95 + Math.random() * 0.1;
      const powerFactor = 0.92 + Math.random() * 0.08;
      const load = 60 + Math.random() * 20;
      
      // Determine grid status
      let status: GridStatus['status'] = 'normal';
      if (voltage < 220 || voltage > 240 || load > 85) status = 'warning';
      if (voltage < 210 || voltage > 250 || load > 95) status = 'critical';
      if (load > 75 && load <= 85) status = 'caution';
      
      updateGridStatus({
        voltage,
        current,
        frequency,
        powerFactor,
        load,
        status
      });

      // Update weather with realistic variations
      const temperature = 32 + Math.random() * 6;
      const temperatureDeviation = (Math.random() - 0.5) * 4;
      const humidity = 65 + Math.random() * 20;
      const windSpeed = 5 + Math.random() * 15;
      const windGusts = windSpeed + Math.random() * 8;
      const weatherRiskScore = Math.min(100, Math.max(0, 
        (temperatureDeviation > 0 ? temperatureDeviation * 10 : 0) +
        (humidity > 80 ? (humidity - 80) * 2 : 0) +
        (windSpeed > 15 ? (windSpeed - 15) * 3 : 0)
      ));

      updateWeather({
        temperature,
        temperatureDeviation,
        humidity,
        windSpeed,
        windGusts,
        weatherRiskScore
      });
    }, 5000);

    // Generate new predictions every 30 seconds
    predictionIntervalRef.current = setInterval(() => {
      const areas = ['Lagos Central', 'Abuja North', 'Port Harcourt', 'Kano East', 'Ibadan West', 'Enugu South'];
      const area = areas[Math.floor(Math.random() * areas.length)];
      
      // Calculate probability based on weather conditions
      const weather = useDashboardStore.getState().weather;
      let baseProbability = 0.2;
      if (weather.weatherRiskScore > 60) baseProbability += 0.3;
      if (weather.temperatureDeviation > 2) baseProbability += 0.2;
      if (weather.humidity > 80) baseProbability += 0.15;
      
      const probability = Math.min(0.95, Math.max(0.05, baseProbability + (Math.random() - 0.5) * 0.3));
       
      
        addPrediction({
          probability,
          riskLevel: getRiskLevel(probability),
          confidence: 0.7 + Math.random() * 0.25,
          estimatedTimeToOutage: 1 + Math.random() * 5,
          affectedArea: area,
          features: {
            temp_deviation: weather.temperatureDeviation,
            humidity: weather.humidity,
            wind_speed: weather.windSpeed,
            voltage: useDashboardStore.getState().gridStatus.voltage,
            load: useDashboardStore.getState().gridStatus.load
          }
        });
    
      
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
    };
  }, [isRunning, updateGridStatus, updateWeather, addPrediction, getRiskLevel, alertThreshold]);

  return { isRunning, setIsRunning };
}

// Hook for dashboard statistics
export function useDashboardStats() {
  const store = useDashboardStore();
  const [stats, setStats] = useState({
    predictionsToday: 0,
    activeAlerts: 0,
    acknowledgedAlerts: 0,
    resolvedAlerts: 0,
    avgAccuracy: 75,
    uptime: 98.5
  });

  useEffect(() => {
    const updateStats = () => {
      const alertsByStatus = store.getAlertsByStatus();
      setStats({
        predictionsToday: store.getPredictionsToday(),
        activeAlerts: alertsByStatus.pending,
        acknowledgedAlerts: alertsByStatus.acknowledged,
        resolvedAlerts: alertsByStatus.resolved,
        avgAccuracy: 75 + Math.floor(Math.random() * 5), 
        uptime: 98.5
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [store]);

  return stats;
}

// Hook for filtered predictions
export function useFilteredPredictions(
  filter: string,
  searchQuery: string,
  dateRange?: { from: Date; to: Date }
) {
  const { predictions } = useDashboardStore();
  
  return predictions.filter(p => {
    if (filter !== 'all' && p.riskLevel !== filter) return false;
    if (searchQuery && !p.affectedArea?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateRange) {
      const pDate = new Date(p.timestamp);
      if (pDate < dateRange.from || pDate > dateRange.to) return false;
    }
    return true;
  });
}

// Hook for filtered alerts
export function useFilteredAlerts(
  priorityFilter: string,
  statusFilter: string,
  searchQuery?: string
) {
  const { alerts } = useDashboardStore();
  
  return alerts.filter(a => {
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery && !a.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
}

// Hook for filtered logs
export function useFilteredLogs(
  categoryFilter: string,
  levelFilter: string,
  searchQuery?: string
) {
  const { logs } = useDashboardStore();
  
  return logs.filter(l => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (searchQuery && !l.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
}

// Hook for time ago formatting
export function useTimeAgo(timestamp: string) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const then = new Date(timestamp);
      const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

      if (diff < 60) setTimeAgo(`${diff}s ago`);
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      else setTimeAgo(`${Math.floor(diff / 86400)}d ago`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}

// Hook for chart data preparation
export function useChartData() {
  const { predictions, alerts } = useDashboardStore();
  
  // Hourly outage pattern
  const hourlyPattern = Array.from({ length: 24 }, (_, hour) => {
    const hourPredictions = predictions.filter(p => {
      const pHour = new Date(p.timestamp).getHours();
      return pHour === hour;
    });
    
    const hourAlerts = alerts.filter(a => {
      const aHour = new Date(a.timestamp).getHours();
      return aHour === hour;
    });
    
    return {
      hour,
      predictions: hourPredictions.length,
      outages: hourAlerts.filter(a => a.type === 'prediction').length,
      avgProbability: hourPredictions.length > 0 
        ? hourPredictions.reduce((acc, p) => acc + p.probability, 0) / hourPredictions.length 
        : 0
    };
  });
  
  // Daily trend (last 7 days)
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    
    const dayPredictions = predictions.filter(p => 
      new Date(p.timestamp).toDateString() === dateStr
    );
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      predictions: dayPredictions.length,
      avgProbability: dayPredictions.length > 0
        ? dayPredictions.reduce((acc, p) => acc + p.probability, 0) / dayPredictions.length
        : 0
    };
  });
  
  // Risk level distribution
  const riskDistribution = [
    { name: 'Low', value: predictions.filter(p => p.riskLevel === 'low').length, color: '#22c55e' },
    { name: 'Moderate', value: predictions.filter(p => p.riskLevel === 'moderate').length, color: '#eab308' },
    { name: 'High', value: predictions.filter(p => p.riskLevel === 'high').length, color: '#f97316' },
    { name: 'Critical', value: predictions.filter(p => p.riskLevel === 'critical').length, color: '#ef4444' }
  ];
  
  // Area distribution
  const areaDistribution = predictions.reduce((acc, p) => {
    const area = p.affectedArea || 'Unknown';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    hourlyPattern,
    dailyTrend,
    riskDistribution,
    areaDistribution: Object.entries(areaDistribution).map(([name, value]) => ({ name, value }))
  };
}

// Export store hook for direct access
export { useDashboardStore };
