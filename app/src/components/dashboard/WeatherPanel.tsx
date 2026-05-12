import { Thermometer, Droplets, Wind, CloudRain, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/types/dashboard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useState, useEffect } from 'react';

interface WeatherPanelProps {
  weather: WeatherData;
}

// Generate weather history data
const generateWeatherHistory = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));
    return {
      hour: hour.getHours(),
      temperature: 28 + Math.sin(i * 0.3) * 5 + Math.random() * 2,
      humidity: 65 + Math.sin(i * 0.2) * 15 + Math.random() * 5,
      windSpeed: 8 + Math.random() * 10,
      weatherRiskScore: 40 + Math.sin(i * 0.4) * 30 + Math.random() * 10
    };
  });
};

export function WeatherPanel({ weather }: WeatherPanelProps) {
  const [history, setHistory] = useState(generateWeatherHistory());

  // Update history when weather changes
  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev.slice(1)];
      newHistory.push({
        hour: new Date().getHours(),
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        weatherRiskScore: weather.weatherRiskScore
      });
      return newHistory;
    });
  }, [weather]);

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 80) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskBgColor = (score: number) => {
    if (score < 40) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            Weather Monitoring
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Temperature */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs">Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{weather.temperature.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">°C</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                weather.temperatureDeviation > 0 ? "text-red-500" : "text-blue-500"
              )}>
                {weather.temperatureDeviation > 0 ? '+' : ''}
                {weather.temperatureDeviation.toFixed(3)}°
              </span>
              <span className="text-muted-foreground">deviation</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="w-4 h-4" />
              <span className="text-xs">Humidity</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{weather.humidity.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <Progress value={weather.humidity} className="h-1.5" />
          </div>

          {/* Wind Speed */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="w-4 h-4" />
              <span className="text-xs">Wind Speed</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{weather.windSpeed.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">km/h</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Gusts: {weather.windGusts.toFixed(1)} km/h
            </div>
          </div>

          {/* Precipitation */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CloudRain className="w-4 h-4" />
              <span className="text-xs">Precipitation</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{weather.precipitation.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">mm</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last 24 hours
            </div>
          </div>
        </div>

        {/* Weather Risk Score */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("w-4 h-4", getRiskColor(weather.weatherRiskScore))} />
              <span className="text-sm font-medium">Weather Risk Score</span>
            </div>
            <span className={cn("text-lg font-bold", getRiskColor(weather.weatherRiskScore))}>
              {Math.round(weather.weatherRiskScore)}
            </span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute h-full rounded-full transition-all duration-500",
                getRiskBgColor(weather.weatherRiskScore)
              )}
              style={{ width: `${weather.weatherRiskScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>

        {/* Temperature History Chart */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">24-Hour Temperature Trend</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}:00`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  labelFormatter={(value) => `${value}:00`}
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tempGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
