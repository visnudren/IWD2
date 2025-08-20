import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentTable from "@/components/students/student-table";
import StudentFilters from "@/components/students/student-filters";
import AddStudentDialog from "@/components/students/add-student-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function Students() {
  const [filters, setFilters] = useState({
    programme: "",
    semester: "",
    status: "",
    search: "",
    limit: 50,
    offset: 0,
    sortBy: "",
    sortOrder: "desc" as "asc" | "desc"
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: studentsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/students", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ 
      ...prev, 
      offset: (page - 1) * prev.limit 
    }));
  };

  const handleExport = () => {
    window.open('/api/students/export', '_blank');
  };

  return (
    <div className="students-container page-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-medium text-gray-900">
                Student Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage student records, performance, and academic progress
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExport}
                className="bg-secondary text-white hover:bg-secondary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <StudentFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
          
          <StudentTable
            data={studentsData}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            currentPage={Math.floor(filters.offset / filters.limit) + 1}
            pageSize={filters.limit}
            onSort={(sortBy, sortOrder) => 
              handleFilterChange({ sortBy, sortOrder })
            }
          />
        </CardContent>
      </Card>

      <AddStudentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
