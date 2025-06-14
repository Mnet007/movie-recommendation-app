import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Check, Ticket, Database, Server, Users } from "lucide-react";
import type { SystemStats } from "@shared/schema";

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: "+12% from last month",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600"
    },
    {
      title: "API Requests",
      value: stats?.apiRequests?.toLocaleString() || "0",
      change: "+8% from yesterday",
      icon: Ticket,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600"
    },
    {
      title: "DB Collections",
      value: stats?.collections?.toString() || "0",
      change: "No change",
      icon: Database,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-gray-600"
    },
    {
      title: "Server Uptime",
      value: stats?.uptime || "99.9%",
      change: "All systems operational",
      icon: Server,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm font-medium mt-1 flex items-center ${stat.changeColor}`}>
                    {stat.changeColor === "text-green-600" && <ArrowUp className="h-3 w-3 mr-1" />}
                    {stat.changeColor === "text-green-600" && stat.change.includes("All systems") && <Check className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
