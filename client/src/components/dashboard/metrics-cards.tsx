import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Trophy, AlertTriangle, TrendingUp } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface MetricsCardsProps {
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-secondary">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalStudents || 0}</p>
              <p className="text-sm text-secondary">+12 this semester</p>
            </div>
            <Users className="w-8 h-8 text-secondary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-primary">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Dean's List</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.deansListCount || 0}</p>
              <p className="text-sm text-primary">CGPA ≥ 3.75</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-error">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Probation List</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.probationCount || 0}</p>
              <p className="text-sm text-error">{"CGPA < 2.00"}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-accent">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg CGPA</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.avgCGPA?.toFixed(2) || "0.00"}</p>
              <p className="text-sm text-accent">+{metrics?.cgpaTrend?.toFixed(2) || "0.00"} vs last sem</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
