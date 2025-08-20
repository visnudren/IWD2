import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Book } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Courses() {
  const [filters, setFilters] = useState({
    programme: "",
    search: "",
  });

  const { toast } = useToast();

  const { data: modules, isLoading } = useQuery({
    queryKey: ["/api/modules", filters.programme],
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete module');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete module",
        variant: "destructive",
      });
    },
  });

  const filteredModules = modules?.filter(module =>
    module.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    module.code.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const getProgrammeColor = (programme: string) => {
    return programme === "Computer Science" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-medium text-gray-900 flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Course & Module Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage course curricula and module information
              </p>
            </div>
            <Button className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modules by name or code..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.programme} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, programme: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Programmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programmes</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modules Grid */}
          {isLoading ? (
            <div className="text-center py-8">Loading modules...</div>
          ) : filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{module.code}</h3>
                        <p className="text-sm text-gray-600 mt-1">{module.name}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteModuleMutation.mutate(module.id)}
                          disabled={deleteModuleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Credits:</span>
                        <Badge variant="secondary">{module.credits}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Semester:</span>
                        <span className="font-medium">{module.semester}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant={module.isCore ? "default" : "outline"}>
                          {module.isCore ? "Core" : "Elective"}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Badge className={getProgrammeColor(module.programme)}>
                          {module.programme}
                        </Badge>
                      </div>
                      {module.prerequisites && module.prerequisites.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {module.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.programme 
                  ? "No modules match your current filters." 
                  : "Get started by adding your first module."
                }
              </p>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
