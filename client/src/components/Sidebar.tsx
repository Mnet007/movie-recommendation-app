import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Box, 
  Ungroup, 
  Settings, 
  Gauge, 
  Users 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge, current: true },
  { name: "Users", href: "/users", icon: Users, current: false },
  { name: "Products", href: "/products", icon: Box, current: false },
  { name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Ungroup className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">FullStack App</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 font-mono">React + Express + PostgreSQL</p>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  item.current
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            API Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-gray-600">Backend</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
