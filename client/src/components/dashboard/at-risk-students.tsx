import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, User } from "lucide-react";
import { Link } from "wouter";
import type { StudentWithDetails } from "@shared/schema";

interface AtRiskStudentsProps {
  students: StudentWithDetails[] | undefined;
  isLoading: boolean;
}

export default function AtRiskStudents({ students, isLoading }: AtRiskStudentsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 text-error mr-2" />
          At-Risk Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students && students.length > 0 ? (
            <>
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center p-3 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    {student.profileImageUrl ? (
                      <img 
                        src={student.profileImageUrl} 
                        alt="Student" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/students/${student.id}`}>
                      <a className="text-sm font-medium text-gray-900 hover:text-primary">
                        {student.firstName} {student.lastName}
                      </a>
                    </Link>
                    <p className="text-xs text-gray-600">{student.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-error">
                      {student.currentCGPA.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">CGPA</p>
                  </div>
                </div>
              ))}
              
              <Link href="/students?status=probation">
                <Button className="w-full mt-3 bg-error text-white hover:bg-red-700">
                  View All At-Risk Students ({students.length})
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No at-risk students identified
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
