import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import CGPATrendsChart from "@/components/dashboard/cgpa-trends-chart";
import PerformanceDistribution from "@/components/dashboard/performance-distribution";
import StorytellingPanel from "@/components/dashboard/storytelling-panel";
import AtRiskStudents from "@/components/dashboard/at-risk-students";
import RecentActivity from "@/components/dashboard/recent-activity";
import PredictiveAnalytics from "@/components/innovative/predictive-analytics";
import CollaborativePlanning from "@/components/innovative/collaborative-planning";
import ThreeDVisualization from "@/components/innovative/3d-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  UserPlus, 
  Upload,
  Brain,
  Users,
  Box,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const [selectedIntake, setSelectedIntake] = useState<string>("all");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/dashboard/insights"],
  });

  const { data: atRiskStudents, isLoading: atRiskLoading } = useQuery({
    queryKey: ["/api/dashboard/at-risk-students"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: availableIntakes } = useQuery({
    queryKey: ["/api/dashboard/intakes"],
  });

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Programme Performance Dashboard
        </h1>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            UEIS Programme Overview
          </p>
          
          {/* Semester/Intake Filter */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Filter by Intake:
            </label>
            <Select value={selectedIntake} onValueChange={setSelectedIntake}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Intakes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intakes</SelectItem>
                {(availableIntakes as string[] || []).map((intake) => (
                  <SelectItem key={intake} value={intake}>
                    {intake}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <MetricsCards metrics={metrics as any} isLoading={metricsLoading} />
      </div>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts and Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <CGPATrendsChart />
          <PerformanceDistribution />
          <StorytellingPanel insights={insights as any} isLoading={insightsLoading} />
        </div>

        {/* Right Column: Quick Actions and Recent Activity */}
        <div className="space-y-8">
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.location.href = '/students'}
              >
                <UserPlus className="w-4 h-4 mr-3 text-primary" />
                <span className="text-sm font-medium">Add New Student</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-3 text-secondary" />
                <span className="text-sm font-medium">Import Students (CSV)</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="w-4 h-4 mr-3 text-accent" />
                <span className="text-sm font-medium">Generate Report</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.open('/api/students/export', '_blank')}
              >
                <Download className="w-4 h-4 mr-3 text-gray-600" />
                <span className="text-sm font-medium">Export Dashboard Data</span>
              </Button>
            </CardContent>
          </Card>

          <AtRiskStudents students={atRiskStudents as any} isLoading={atRiskLoading} />
          <RecentActivity activities={recentActivity as any} isLoading={activityLoading} />
        </div>
      </div>

      {/* Innovative Features Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-6 flex items-center">
          <Brain className="w-6 h-6 text-accent mr-3" />
          Innovative Features
        </h2>
        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          <PredictiveAnalytics />
          <CollaborativePlanning />
          <ThreeDVisualization />
        </div>
      </div>
    </div>
  );
}
