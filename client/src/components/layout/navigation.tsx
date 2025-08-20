import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText,
  Bell,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GraduationCap className="text-white text-2xl mr-3 w-8 h-8" />
              <span className="text-white text-xl font-medium">SPMS - Programme Leader</span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <a className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-white bg-blue-700'
                        : 'text-blue-200 hover:text-white hover:bg-blue-600'
                    }`}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:text-blue-200 hover:bg-blue-600 relative"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 bg-error text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">DJ</span>
              </div>
              <span className="hidden sm:block text-white text-sm font-medium">Dr. Sarah Johnson</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:text-blue-200 hover:bg-blue-600"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-blue-200 hover:bg-blue-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-white bg-blue-800'
                        : 'text-blue-200 hover:text-white hover:bg-blue-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
