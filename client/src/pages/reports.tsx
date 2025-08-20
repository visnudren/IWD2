import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import { Download, FileText, BarChart3, TrendingUp, Users, AlertTriangle } from "lucide-react";

export default function Reports() {
  const [reportConfig, setReportConfig] = useState({
    type: "performance",
    programme: "",
    semester: "",
    dateRange: "current_semester"
  });

  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/dashboard/insights"],
  });

  const generateReport = async (type: string) => {
    // This would generate and download the report
    console.log(`Generating ${type} report...`);
  };

  const exportToPDF = () => {
    generateReport('pdf');
  };

  const exportToCSV = () => {
    window.open('/api/students/export', '_blank');
  };

  return (
    <div className="reports-container page-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Generate comprehensive reports and export data for analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <Select 
                  value={reportConfig.type} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Summary</SelectItem>
                    <SelectItem value="student_list">Student List</SelectItem>
                    <SelectItem value="cgpa_trends">CGPA Trends</SelectItem>
                    <SelectItem value="at_risk">At-Risk Students</SelectItem>
                    <SelectItem value="dean_list">Dean's List</SelectItem>
                    <SelectItem value="probation">Probation List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programme
                </label>
                <Select 
                  value={reportConfig.programme} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, programme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Programmes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programmes</SelectItem>
                    <SelectItem value="UEIS">UEIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <Select 
                  value={reportConfig.semester} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <Select 
                  value={reportConfig.dateRange} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_semester">Current Semester</SelectItem>
                    <SelectItem value="last_semester">Last Semester</SelectItem>
                    <SelectItem value="academic_year">Academic Year</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={exportToPDF}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </Button>
                <Button 
                  onClick={exportToCSV}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview and Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.totalStudents || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Dean's List</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.deansListCount || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Probation</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.probationCount || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Avg CGPA</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics?.avgCGPA?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">Student Performance Summary</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Comprehensive overview of student academic performance including CGPA trends, pass/fail rates, and grade distribution.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport('performance')}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">At-Risk Students Report</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Detailed analysis of students at academic risk with recommended intervention strategies.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport('at_risk')}
                    className="bg-error text-white hover:bg-red-700"
                  >
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">Dean's List Recognition</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    List of high-achieving students eligible for Dean's List recognition this semester.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport('dean_list')}
                    className="bg-secondary text-white hover:bg-green-700"
                  >
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">Programme Progression Analysis</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Analysis of student progression through programme requirements and graduation timeline.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport('progression')}
                    className="bg-accent text-white hover:bg-orange-700"
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights Preview */}
          {insights && insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.slice(0, 3).map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'positive' ? 'bg-green-50 border-secondary' :
                        insight.type === 'warning' ? 'bg-orange-50 border-accent' :
                        'bg-red-50 border-error'
                      }`}
                    >
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
