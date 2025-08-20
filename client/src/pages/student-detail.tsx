import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, User } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function StudentDetail() {
  const { id } = useParams();

  const { data: student, isLoading } = useQuery({
    queryKey: ["/api/students", id],
    enabled: !!id,
  });

  const { data: cgpaHistory } = useQuery({
    queryKey: ["/api/students", id, "cgpa-history"],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading student details...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Student not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dean's List": return "bg-yellow-100 text-yellow-800";
      case "Probation": return "bg-red-100 text-red-800";
      case "Active": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgrammeColor = (programme: string) => {
    return programme === "Computer Science" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
  };

  const chartData = cgpaHistory?.map(record => ({
    semester: `Sem ${record.semester}`,
    cgpa: parseFloat(record.cumulativeCGPA)
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium text-gray-900">
            Student Profile - {student.firstName} {student.lastName}
          </h1>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Information Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {student.profileImageUrl ? (
                    <img 
                      src={student.profileImageUrl} 
                      alt="Student" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </h4>
                <p className="text-sm text-gray-600">{student.id}</p>
                <Badge className={getProgrammeColor(student.programme)}>
                  {student.programme}
                </Badge>
                <div className="mt-2">
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {student.email}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Current CGPA</label>
                  <p className="text-2xl font-bold text-primary">{student.currentCGPA.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Credits Earned</label>
                  <p className="text-lg font-medium">{student.totalCreditsEarned} / 120</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Semester</label>
                  <p className="text-lg font-medium">{student.currentSemester}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Semesters Left</label>
                  <p className="text-lg font-medium">{student.semestersLeft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Details */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* Academic Progress Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Academic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 4]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="cgpa" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Semester Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  Academic Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.results.length > 0 ? (
                    student.results.map((result, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium">
                            {result.module.code} - {result.module.name}
                          </span>
                          <div className="text-xs text-gray-500">
                            Semester {result.semester} • {result.module.credits} credits
                          </div>
                        </div>
                        <div className="text-right">
                          {result.grade && (
                            <Badge variant="secondary" className="mb-1">
                              {result.grade}
                            </Badge>
                          )}
                          <div className="text-xs text-gray-500">
                            {result.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No academic results found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Alerts */}
            {student.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Academic Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.alerts.map((alert, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border-l-4 ${
                          alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                          alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {alert.alertType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
