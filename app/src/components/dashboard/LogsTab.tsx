import { useState, useMemo } from 'react';
import { 
  FileText, Search, Download, Filter, Calendar, User, Activity, 
  AlertTriangle, Info, CheckCircle, Trash2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDashboardStore, useFilteredLogs } from '@/hooks/useDashboard';
import { format } from 'date-fns';

export function LogsTab() {
  const { logs, clearLogs, addLog } = useDashboardStore();
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter logs
  const filteredLogs = useFilteredLogs(categoryFilter, levelFilter, searchQuery);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(logs.map(l => l.category));
    return ['all', ...Array.from(cats)];
  }, [logs]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog({
      level: 'success',
      category: 'System',
      message: 'Logs exported successfully',
      details: `${filteredLogs.length} logs exported`
    });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      clearLogs();
      addLog({
        level: 'warning',
        category: 'System',
        message: 'All logs cleared',
        details: 'User initiated log cleanup'
      });
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
    success: logs.filter(l => l.level === 'success').length
  }), [logs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Logs</h2>
          <p className="text-muted-foreground">View and manage system activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} icon={FileText} />
        <StatCard title="Info" value={stats.info} icon={Info} color="text-blue-500" />
        <StatCard title="Warnings" value={stats.warning} icon={AlertTriangle} color="text-yellow-500" />
        <StatCard title="Errors" value={stats.error} icon={AlertTriangle} color="text-red-500" />
        <StatCard title="Success" value={stats.success} icon={CheckCircle} color="text-green-500" />
      </div>

      {/* Filters */}
      <Card className="glass-panel">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-border bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <Activity className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setCategoryFilter('all');
                  setLevelFilter('all');
                  setSearchQuery('');
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Log Entries ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No logs found matching your criteria</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cn("text-xs", getLevelColor(log.level))}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                          </span>
                          {log.user && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Entry Details</DialogTitle>
            <DialogDescription>
              ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(getLevelColor(selectedLog.level))}>
                  {selectedLog.level}
                </Badge>
                <Badge variant="outline">{selectedLog.category}</Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                <p className="font-medium">
                  {format(new Date(selectedLog.timestamp), 'MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="font-medium">{selectedLog.message}</p>
              </div>
              
              {selectedLog.details && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Details</p>
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
              )}
              
              {selectedLog.user && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedLog.user}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  color = "text-foreground"
}: { 
  title: string; 
  value: number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card className="glass-panel">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </CardContent>
    </Card>
  );
}
