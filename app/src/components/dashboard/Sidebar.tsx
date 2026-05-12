import { 
  LayoutDashboard, 
  Activity, 
  Bell, 
  BarChart3, 
  Settings, 
  FileText,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predictions', label: 'Predictions', icon: Activity },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'logs', label: 'System Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, collapsed = false }: SidebarProps) {
  return (
    <div className={cn(
      "min-h-screen lg:h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-50 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">PowerGrid AI</span>
              <span className="text-xs text-muted-foreground">Nigeria</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              <div className={cn(
                "flex flex-1 items-center justify-between transition-all duration-300",
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}>
                <span className="flex-1 text-left whitespace-nowrap ml-3">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20",
          collapsed && "justify-center"
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!collapsed && (
            <span className="text-sm font-medium text-green-500">System Online</span>
          )}
        </div>
      </div>
    </div>
  );
}
