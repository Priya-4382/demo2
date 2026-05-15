import { useState, useMemo } from 'react';
import { 
  Activity, Filter, Download, Calendar, MapPin, TrendingUp, Clock, 
  Trash2, Eye, Plus, RefreshCw, ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useDashboardStore, useFilteredPredictions, useChartData } from '@/hooks/useDashboard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { format } from 'date-fns';

export function PredictionsTab() {
  const { predictions, deletePrediction, addPrediction } = useDashboardStore();
  const { hourlyPattern, dailyTrend, riskDistribution } = useChartData();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<typeof predictions[0] | null>(null);
  
  // New prediction form
  const [newPrediction, setNewPrediction] = useState({
    probability: 50,
    affectedArea: '',
    estimatedTimeToOutage: 2
  });

  // Filter predictions
  const filteredPredictions = useFilteredPredictions(
    filter, 
    searchQuery, 
    dateRange.from && dateRange.to 
      ? { from: dateRange.from, to: dateRange.to } 
      : undefined
  );

  // Pagination
  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
  const paginatedPredictions = filteredPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredPredictions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `predictions-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePrediction = () => {
    const prob = newPrediction.probability / 100;
    addPrediction({
      probability: prob,
      riskLevel: prob < 0.3 ? 'low' : prob < 0.6 ? 'moderate' : prob < 0.8 ? 'high' : 'critical',
      confidence: 0.7 + Math.random() * 0.25,
      estimatedTimeToOutage: newPrediction.estimatedTimeToOutage,
      affectedArea: newPrediction.affectedArea || 'Unknown Area',
      features: {
        temp_deviation: (Math.random() - 0.5) * 4,
        humidity: 60 + Math.random() * 25,
        wind_speed: 5 + Math.random() * 15,
        voltage: 228 + Math.random() * 6,
        load: 50 + Math.random() * 40
      }
    });
    setCreateDialogOpen(false);
    setSuccessDialogOpen(true)
    setNewPrediction({ probability: 50, affectedArea: '', estimatedTimeToOutage: 2 });
  };

  // Stats
  const stats = useMemo(() => ({
    total: predictions.length,
    highRisk: predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
    avgConfidence: predictions.length > 0 
      ? (predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length * 100).toFixed(0)
      : '0',
    today: predictions.filter(p => 
      new Date(p.timestamp).toDateString() === new Date().toDateString()
    ).length
  }), [predictions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Predictions</h2>
          <p className="text-muted-foreground">View and manage outage predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Prediction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Predictions" value={stats.total} trend="All time" />
        <StatCard 
          title="High Risk" 
          value={stats.highRisk}
          trend="Needs attention"
          alert={stats.highRisk > 0}
        />
        <StatCard title="Avg Confidence" value={`${stats.avgConfidence}%`} trend="Model metric" />
        <StatCard title="Today" value={stats.today} trend="Last 24h" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Pattern */}
        <Card className="glass-panel lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Hourly Prediction Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyPattern}>
                  <defs>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(value) => `${value}:00`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predictions" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#predGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">7-Day Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predictions" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Prediction History ({filteredPredictions.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input 
                placeholder="Search area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateRange.from ? format(dateRange.from, 'MMM d') : 'Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  />
                </PopoverContent>
              </Popover>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                  setDateRange({});
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto reative">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className= "sticky left-0 z-20 bg-card/95 backdrop-blur-xl border-none">Time</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="hidden sm:table-cell">ETA</TableHead>
                  <TableHead className="hidden sm:table-cell">Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPredictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell className="sticky left-0 z-10 bg-card/95 backdrop-blur-xl font-medium border-none">
                      {format(new Date(prediction.timestamp), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", getRiskColor(prediction.riskLevel))}>
                        {prediction.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium w-10",
                          prediction.probability > 0.8 ? "text-red-500" :
                          prediction.probability > 0.6 ? "text-orange-500" :
                          prediction.probability > 0.3 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {Math.round(prediction.probability * 100)}%
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              prediction.probability > 0.8 ? "bg-red-500" :
                              prediction.probability > 0.6 ? "bg-orange-500" :
                              prediction.probability > 0.3 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${prediction.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {prediction.affectedArea}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        ~{prediction.estimatedTimeToOutage}h
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        {Math.round(prediction.confidence * 100)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPrediction(prediction);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePrediction(prediction.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPredictions.length)} of {filteredPredictions.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Prediction Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
            <DialogDescription>
              ID: {selectedPrediction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Probability</p>
                  <p className={cn(
                    "text-xl font-bold",
                    selectedPrediction.probability > 0.8 ? "text-red-500" :
                    selectedPrediction.probability > 0.6 ? "text-orange-500" :
                    selectedPrediction.probability > 0.3 ? "text-yellow-500" : "text-green-500"
                  )}>
                    {Math.round(selectedPrediction.probability * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <Badge variant="outline" className={cn("mt-1", getRiskColor(selectedPrediction.riskLevel))}>
                    {selectedPrediction.riskLevel}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-medium">{Math.round(selectedPrediction.confidence * 100)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Time to Outage</p>
                  <p className="text-lg font-medium">~{selectedPrediction.estimatedTimeToOutage}h</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Affected Area</p>
                <p className="font-medium">{selectedPrediction.affectedArea}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Features Used</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedPrediction.features).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Prediction Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Prediction</DialogTitle>
            <DialogDescription>
              Manually create a new outage prediction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Probability (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={newPrediction.probability}
                onChange={(e) => setNewPrediction({ ...newPrediction, probability: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0%</span>
                <span className="font-medium text-foreground">{newPrediction.probability}%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Affected Area</label>
              <Input
                placeholder="Enter area name..."
                value={newPrediction.affectedArea}
                onChange={(e) => setNewPrediction({ ...newPrediction, affectedArea: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Time to Outage (hours)</label>
              <Input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={newPrediction.estimatedTimeToOutage}
                onChange={(e) => setNewPrediction({ ...newPrediction, estimatedTimeToOutage: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={handleCreatePrediction}>
              Create Prediction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl">Prediction Created</DialogTitle>
            <DialogDescription className="mt-2">
              The new outage prediction has been added successfully.
            </DialogDescription>
          
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  trend,
  alert
}: { 
  title: string; 
  value: string | number; 
  trend: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn("glass-panel w-full min-w-0", alert && "border-red-500/30")}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1 truncate">{title}</p>
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl text-2xl font-bold truncate">{value}</span>
          <span className={cn(
            "text-[10px] sm:text-xs shrink-0 whitespace-nowrap",
            alert ? "text-red-500" : "text-muted-foreground"
          )}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
