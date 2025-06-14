import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SystemStats } from "@shared/schema";

export default function SystemHealth() {
  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500";
    if (value < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900">System Health</CardTitle>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          All Good
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU Usage</span>
                <span className="text-sm text-gray-900 font-mono">{stats?.cpuUsage || 0}%</span>
              </div>
              <Progress 
                value={stats?.cpuUsage || 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Memory Usage</span>
                <span className="text-sm text-gray-900 font-mono">{stats?.memoryUsage || 0}%</span>
              </div>
              <Progress 
                value={stats?.memoryUsage || 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Storage</span>
                <span className="text-sm text-gray-900 font-mono">{stats?.storageUsage || 0}%</span>
              </div>
              <Progress 
                value={stats?.storageUsage || 0} 
                className="h-2"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-3">API Endpoints Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">/api/users</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    200 OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">/api/stats</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    200 OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">/api/activities</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    200 OK
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
