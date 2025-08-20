import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";
import type { PerformanceInsight } from "@shared/schema";

interface StorytellingPanelProps {
  insights: PerformanceInsight[] | undefined;
  isLoading: boolean;
}

export default function StorytellingPanel({ insights, isLoading }: StorytellingPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-secondary';
      case 'warning':
        return 'bg-orange-50 border-accent';
      case 'critical':
        return 'bg-red-50 border-error';
      default:
        return 'bg-blue-50 border-primary';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-secondary';
      case 'warning':
        return 'text-accent';
      case 'critical':
        return 'text-error';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
          <Lightbulb className="w-5 h-5 text-accent mr-2" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights && insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getInsightStyle(insight.type)}`}
              >
                <h4 className={`text-sm font-medium mb-1 ${getInsightColor(insight.type)}`}>
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700">
                  {insight.description}
                </p>
                {insight.actionRequired && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Action Required
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No insights available at the moment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
