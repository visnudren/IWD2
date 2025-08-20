import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface StudentFiltersProps {
  filters: {
    programme: string;
    semester: string;
    status: string;
    search: string;
  };
  onFilterChange: (filters: Partial<StudentFiltersProps['filters']>) => void;
}

export default function StudentFilters({ filters, onFilterChange }: StudentFiltersProps) {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Students
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programme
          </label>
          <Select 
            value={filters.programme} 
            onValueChange={(value) => onFilterChange({ programme: value })}
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
            value={filters.semester} 
            onValueChange={(value) => onFilterChange({ semester: value })}
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
            Status
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Probation">Probation</SelectItem>
              <SelectItem value="Dean's List">Dean's List</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
