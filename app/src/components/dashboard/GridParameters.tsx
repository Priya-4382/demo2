import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/hooks/useDashboard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useState, useEffect } from 'react';

// Generate voltage history
const generateVoltageHistory = () => {
  return Array.from({ length: 60 }, (_, i) => ({
    minute: i,
    l1: 228 + Math.random() * 6,
    l2: 227 + Math.random() * 6,
    l3: 229 + Math.random() * 6
  }));
};

export function GridParameters() {
  const { gridStatus } = useDashboardStore();
  const [voltageHistory, setVoltageHistory] = useState(generateVoltageHistory());

  // Update voltage history
  useEffect(() => {
    const interval = setInterval(() => {
      setVoltageHistory(prev => {
        const newHistory = [...prev.slice(1)];
        newHistory.push({
          minute: prev[prev.length - 1].minute + 1,
          l1: gridStatus.voltage + (Math.random() - 0.5) * 2,
          l2: gridStatus.voltage + (Math.random() - 0.5) * 2 - 1,
          l3: gridStatus.voltage + (Math.random() - 0.5) * 2 + 1
        });
        return newHistory;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [gridStatus.voltage]);

  const parameters = [
    { 
      name: 'Voltage L1', 
      value: gridStatus.voltage, 
      unit: 'V', 
      normal: [220, 240] as [number, number]
    },
    { 
      name: 'Voltage L2', 
      value: gridStatus.voltage - 0.7, 
      unit: 'V', 
      normal: [220, 240] as [number, number]
    },
    { 
      name: 'Voltage L3', 
      value: gridStatus.voltage + 0.7, 
      unit: 'V', 
      normal: [220, 240] as [number, number]
    },
    { 
      name: 'Current L1', 
      value: gridStatus.current, 
      unit: 'A', 
      normal: [20, 60] as [number, number]
    },
    { 
      name: 'Current L2', 
      value: gridStatus.current - 2.4, 
      unit: 'A', 
      normal: [20, 60] as [number, number]
    },
    { 
      name: 'Current L3', 
      value: gridStatus.current - 0.7, 
      unit: 'A', 
      normal: [20, 60] as [number, number]
    },
    { 
      name: 'Frequency', 
      value: gridStatus.frequency, 
      unit: 'Hz', 
      normal: [49.8, 50.2] as [number, number]
    },
    { 
      name: 'Power Factor', 
      value: gridStatus.powerFactor, 
      unit: '', 
      normal: [0.9, 1.0] as [number, number]
    }
  ];

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Live Grid Parameters
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
            Real-time
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameters Grid */}
        <div className="grid grid-cols-2 gap-2">
          {parameters.map((param) => (
            <div 
              key={param.name} 
              className="p-2.5 rounded-lg bg-muted/50 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{param.name}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={cn(
                    "text-base font-semibold",
                    param.value < param.normal[0] || param.value > param.normal[1] 
                      ? "text-yellow-500" 
                      : "text-foreground"
                  )}>
                    {param.value.toFixed(param.name.includes('Power') ? 2 : 1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{param.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">
                  {param.normal[0]}-{param.normal[1]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voltage Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Voltage Trend (Last Hour)</p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">L1</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">L2</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">L3</span>
              </div>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={voltageHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="minute" 
                  hide
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  domain={[220, 240]}
                  tickFormatter={(value) => `${value}V`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <ReferenceLine y={220} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine y={240} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                <Line 
                  type="monotone" 
                  dataKey="l1" 
                  stroke="#3b82f6" 
                  strokeWidth={1.5}
                  dot={false}
                  name="L1"
                />
                <Line 
                  type="monotone" 
                  dataKey="l2" 
                  stroke="#22c55e" 
                  strokeWidth={1.5}
                  dot={false}
                  name="L2"
                />
                <Line 
                  type="monotone" 
                  dataKey="l3" 
                  stroke="#f97316" 
                  strokeWidth={1.5}
                  dot={false}
                  name="L3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
