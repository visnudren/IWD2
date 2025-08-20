import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLog } from "@shared/schema";

interface RecentActivityProps {
  activities: ActivityLog[] | undefined;
  isLoading: boolean;
}

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-secondary';
      case 'UPDATE':
        return 'bg-accent';
      case 'DELETE':
        return 'bg-error';
      default:
        return 'bg-primary';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div 
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${getActivityColor(activity.action)}`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-600">
                    {formatTime(activity.createdAt!)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
