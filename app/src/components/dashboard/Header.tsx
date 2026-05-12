import { Bell, User, Wifi, WifiOff, Clock, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isConnected: boolean;
  lastUpdate: Date;
  pendingAlerts: number;
  onMenuClick?: () => void;
}

export function Header({ isConnected, lastUpdate, pendingAlerts, onMenuClick }: HeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            Power Outage Prediction System
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={cn(
            "text-xs font-medium",
            isConnected ? "text-green-500" : "text-red-500"
          )}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Last Update */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatTime(lastUpdate)}
          </span>
        </div>

        {/* Alerts */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {pendingAlerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingAlerts}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <span className="font-medium">Notifications</span>
            </div>
            {pendingAlerts > 0 ? (
              <>
                <DropdownMenuItem className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">High Risk Alert</span>
                    <span className="text-xs text-muted-foreground">
                      Outage probability (72%) detected for Lagos Central
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">System Update</span>
                    <span className="text-xs text-muted-foreground">
                      Model accuracy improved to 75%
                    </span>
                  </div>
                </DropdownMenuItem>
              </>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
