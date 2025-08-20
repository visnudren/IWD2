import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, BookOpen, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'student':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'module':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'result':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatActivityTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getNotificationCount = () => {
    return Array.isArray(activities) ? activities.length : 0;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:text-blue-200 hover:bg-blue-600 relative"
        >
          <Bell className="w-5 h-5" />
          {getNotificationCount() > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
              {getNotificationCount()}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Activity</h3>
            <Badge variant="secondary" className="text-xs">
              {getNotificationCount()} updates
            </Badge>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading activities...
          </div>
        ) : Array.isArray(activities) && activities.length > 0 ? (
          activities.slice(0, 10).map((activity: Activity) => (
            <DropdownMenuItem key={activity.id} className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.entityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatActivityTime(activity.createdAt)}
                  {activity.performedBy && (
                    <span className="ml-1">by {activity.performedBy}</span>
                  )}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            No recent activity to show
          </div>
        )}
        
        {Array.isArray(activities) && activities.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-blue-600 cursor-pointer">
              View all activities
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}