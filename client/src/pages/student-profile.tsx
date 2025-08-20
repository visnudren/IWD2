import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Award,
  AlertTriangle
} from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: [`/api/students/${id}`],
  });

  const { data: cgpaHistory, isLoading: cgpaLoading } = useQuery({
    queryKey: [`/api/students/${id}/cgpa-history`],
  });

  const { data: studentResults, isLoading: resultsLoading } = useQuery({
    queryKey: [`/api/students/${id}/results`],
  });

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600">The student you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Probation': return 'bg-red-100 text-red-800';
      case "Dean's List": return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'bg-green-100 text-green-800';
    if (['B+', 'B', 'B-'].includes(grade)) return 'bg-blue-100 text-blue-800';
    if (['C+', 'C', 'C-'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
    if (['D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-800';
    if (grade === 'F') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Group results by intake/semester
  const groupedResults = (studentResults || []).reduce((acc: any, result: any) => {
    const semester = result.semester || 'Unknown';
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(result);
    return acc;
  }, {});

  return (
    <div className="student-profile-container page-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600 text-lg">{student.id}</p>
            </div>
          </div>
          <Badge className={getStatusColor(student.status)}>
            {student.status}
          </Badge>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{student.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Programme</p>
                <p className="text-lg font-semibold text-gray-900">{student.programme}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Intake</p>
                <p className="text-lg font-semibold text-gray-900">{student.intake || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current CGPA</p>
                <p className="text-lg font-semibold text-gray-900">
                  {student.currentCGPA ? student.currentCGPA.toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="academic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="academic" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Academic Records</span>
          </TabsTrigger>
          <TabsTrigger value="cgpa" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>CGPA Trends</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Records by Intake Period</CardTitle>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading academic records...</p>
                </div>
              ) : Object.keys(groupedResults).length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No academic records found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedResults).map(([semester, results]: [string, any]) => (
                    <div key={semester}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        {semester} Intake
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(results as any[]).map((result: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{result.module?.name}</h4>
                              <p className="text-sm text-gray-600">{result.module?.code}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                {result.module?.credits} credits
                              </span>
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cgpa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CGPA History</CardTitle>
            </CardHeader>
            <CardContent>
              {cgpaLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading CGPA history...</p>
                </div>
              ) : !cgpaHistory || cgpaHistory.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No CGPA history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cgpaHistory.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Semester {record.semester} - {record.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          Credits: {record.totalCreditsEarned}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {parseFloat(record.cumulativeCGPA).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">CGPA</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Programme:</span>
                    <span className="font-medium">{student.programme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intake:</span>
                    <span className="font-medium">{student.intake || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits Earned:</span>
                    <span className="font-medium">{student.creditsEarned || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current CGPA:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {student.currentCGPA ? student.currentCGPA.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Subjects:</span>
                    <span className="font-medium">
                      {studentResults ? studentResults.length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Academic Standing:</span>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}