import { Activity, Zap, Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { GridStatus } from '@/types/dashboard';

interface GridStatusPanelProps {
  status: GridStatus;
}

export function GridStatusPanel({ status }: GridStatusPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTrendIcon = (current: number, normal: [number, number]) => {
    if (current < normal[0]) return <TrendingDown className="w-4 h-4 text-yellow-500" />;
    if (current > normal[1]) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <Minus className="w-4 h-4 text-green-500" />;
  };

  const metrics = [
    { 
      name: 'Voltage', 
      value: status.voltage, 
      unit: 'V', 
      min: 200, 
      max: 260, 
      normal: [220, 240] as [number, number],
      icon: Zap
    },
    { 
      name: 'Current', 
      value: status.current, 
      unit: 'A', 
      min: 0, 
      max: 100, 
      normal: [20, 60] as [number, number],
      icon: Gauge
    },
    { 
      name: 'Frequency', 
      value: status.frequency, 
      unit: 'Hz', 
      min: 49.5, 
      max: 50.5, 
      normal: [49.8, 50.2] as [number, number],
      icon: Activity
    },
    { 
      name: 'Power Factor', 
      value: status.powerFactor, 
      unit: '', 
      min: 0.8, 
      max: 1.0, 
      normal: [0.9, 1.0] as [number, number],
      icon: TrendingUp
    }
  ];

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Grid Health Overview
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize font-medium",
              status.status === 'normal' && "border-green-500 text-green-500",
              status.status === 'caution' && "border-yellow-500 text-yellow-500",
              status.status === 'warning' && "border-orange-500 text-orange-500",
              status.status === 'critical' && "border-red-500 text-red-500"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full mr-1.5 animate-pulse", getStatusColor(status.status))} />
            {getStatusText(status.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <metric.icon className="w-4 h-4" />
                <span className="text-xs">{metric.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-2xl font-bold",
                  metric.value < metric.normal[0] || metric.value > metric.normal[1] 
                    ? "text-yellow-500" 
                    : "text-foreground"
                )}>
                  {metric.value.toFixed(metric.name === 'Frequency' ? 2 : 1)}
                </span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={((metric.value - metric.min) / (metric.max - metric.min)) * 100} 
                  className="h-1.5 flex-1"
                />
                {getTrendIcon(metric.value, metric.normal)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Normal: {metric.normal[0]}-{metric.normal[1]}{metric.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Load Bar */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">System Load</span>
            <span className={cn(
              "text-sm font-medium",
              status.load > 85 ? "text-red-500" :
              status.load > 70 ? "text-yellow-500" : "text-green-500"
            )}>
              {status.load.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute h-full rounded-full transition-all duration-500",
                status.load < 60 ? "bg-green-500" :
                status.load < 80 ? "bg-yellow-500" :
                status.load < 90 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${status.load}%` }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 left-[60%] w-0.5 h-full bg-white/30" />
            <div className="absolute top-0 left-[80%] w-0.5 h-full bg-white/30" />
            <div className="absolute top-0 left-[90%] w-0.5 h-full bg-white/30" />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-green-500">60%</span>
            <span className="text-yellow-500">80%</span>
            <span className="text-orange-500">90%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
