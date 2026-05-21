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
import { useDashboardStore } from '@/store/dashboardStore';
import type { AppNotification } from '@/types/dashboard';
import { useState, useEffect } from 'react';


interface HeaderProps {
  isConnected: boolean;
  lastUpdate: Date;
  pendingAlerts: number;
  onMenuClick?: () => void;
 }
 export function Header({ isConnected, lastUpdate, onMenuClick,}: HeaderProps) {
 
  const handleProfileClick = () => {
    console.log("Header icon clicked!");
    
  };
   const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };
  const { notifications,notificationSettings,pendingAlertsCount, resetAlertCount, clearNotifications } = useDashboardStore();
 const activeNotifications = notificationSettings.pushEnabled ? notifications : [];
const activeCount = notificationSettings.pushEnabled ? pendingAlertsCount : 0;


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
          <h1 className="text-lg font-semibold text-foreground hidden lg:block">
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


         {/* real time */}
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-muted">
             <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
               <span className="text-[10px] sm:text-xs font-mono text-muted-foreground min-w-[65px] sm:min-w-[80px]">
                {formatTime(currentTime)}
                   </span>
                      </div>

        {/* Alerts */}
        <DropdownMenu onOpenChange={(open) => {
         
         
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            {activeCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {activeCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>


          <DropdownMenuContent align="end" className="w-80">
           <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="font-medium text-sm">Notifications</span>
           
           {activeNotifications.length > 0 && (
            <Button
                  variant="ghost"
                 className="text-xs text-red-500 h-8 px-2 hover:accent hover:text-red-600 transition-colors"
                  onClick={(e) => {
                   e.stopPropagation();
                   clearNotifications();
                       }}
                >
                  Clear All
                </Button>
              )}
            </div>

                <div className="max-h-[300px] overflow-y-auto">
              {activeNotifications.length > 0 ? (
               activeNotifications.map((notif) => {
   
                  const isCritical = notif.type === 'critical';
                   const isHigh = notif.type === 'high';
                     const isModerate = notif.type === 'moderate';


                     return (
                  <DropdownMenuItem key={notif.id} className="py-3 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                           notif.type === 'critical' ? "bg-red-600" :
                           notif.type === 'high' ? "bg-orange-500" :
                            (notif.type === 'moderate'|| notif.type === 'medium') ? "bg-yellow-400" :
                                 notif.type === 'low' ? "bg-green-500" : "bg-blue-500"
                             )} />
     
     
                             <span className={cn(
                               "text-[10px] font-bold uppercase tracking-wider",
                               notif.type === 'critical' ? "text-red-600" :
                                  notif.type === 'high' ? "text-orange-600" :
                                (notif.type === 'moderate' || notif.type === 'medium') ? "text-yellow-600" :
                                notif.type === 'low' ? "text-green-600" : "text-muted-foreground"
                                      )}>
                                  {notif.type} Alert
                                  </span>
                                     </div>

                                  <span className="text-sm">{notif.message}</span>
                                   <span className="text-[10px] text-muted-foreground">
                                   {new Date(notif.timestamp).toLocaleTimeString()}
                                      </span>
                                      </DropdownMenuItem>
                                          );
                                           })
                                            ) : (
                                           <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                            {notificationSettings.pushEnabled
                                              ? "No new notifications"
                                               : "Push notifications are disabled"}
                                                    </div>
                                                       )}
                                                   </div>
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
            <DropdownMenuItem className="text-red-500" >Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}






