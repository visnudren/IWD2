import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Edit, 
  Trash2, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StudentWithDetails } from "@shared/schema";

interface StudentTableProps {
  data: { students: StudentWithDetails[]; total: number } | undefined;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
  pageSize: number;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export default function StudentTable({
  data,
  isLoading,
  onPageChange,
  currentPage,
  pageSize,
  onSort
}: StudentTableProps) {
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete student');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dean's List":
        return "bg-yellow-100 text-yellow-800";
      case "Probation":
        return "bg-red-100 text-red-800";
      case "Active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgrammeColor = (programme: string) => {
    return programme === "Computer Science" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const students = data?.students || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                Student Name
                <span className="ml-1 text-xs opacity-50">⇅</span>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('id')}
              >
                Student ID
                <span className="ml-1 text-xs opacity-50">⇅</span>
              </TableHead>
              <TableHead>Programme</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('cgpa')}
              >
                CGPA
                <span className="ml-1 text-xs opacity-50">⇅</span>
              </TableHead>
              <TableHead>Credits Earned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center">
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{student.id}</TableCell>
                  <TableCell>
                    <Badge className={getProgrammeColor(student.programme)}>
                      {student.programme}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {student.currentCGPA.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">out of 4.00</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {student.totalCreditsEarned} / 120
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {student.currentSemester}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteStudentMutation.mutate(student.id)}
                        disabled={deleteStudentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, total)}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, total)}
          </span>{" "}
          of <span className="font-medium">{total}</span> students
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, currentPage - 2) + i;
            if (page > totalPages) return null;
            
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={page === currentPage ? "bg-primary text-white" : ""}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
