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
            Intake
          </label>
          <Select 
            value={filters.semester} 
            onValueChange={(value) => onFilterChange({ semester: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Intakes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Intakes</SelectItem>
              <SelectItem value="Jun-25">Jun-25</SelectItem>
              <SelectItem value="Apr-25">Apr-25</SelectItem>
              <SelectItem value="Feb-25">Feb-25</SelectItem>
              <SelectItem value="Oct-24">Oct-24</SelectItem>
              <SelectItem value="Sep-24">Sep-24</SelectItem>
              <SelectItem value="May-24">May-24</SelectItem>
              <SelectItem value="Mar-24">Mar-24</SelectItem>
              <SelectItem value="Jan-24">Jan-24</SelectItem>
              <SelectItem value="Jan-23">Jan-23</SelectItem>
              <SelectItem value="Mar-23">Mar-23</SelectItem>
              <SelectItem value="May-23">May-23</SelectItem>
              <SelectItem value="Jul-23">Jul-23</SelectItem>
              <SelectItem value="Sep-23">Sep-23</SelectItem>
              <SelectItem value="Oct-23">Oct-23</SelectItem>
              <SelectItem value="Jan-22">Jan-22</SelectItem>
              <SelectItem value="May-22">May-22</SelectItem>
              <SelectItem value="Sep-22">Sep-22</SelectItem>
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
