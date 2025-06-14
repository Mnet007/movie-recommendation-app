import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import RecentActivity from "@/components/RecentActivity";
import SystemHealth from "@/components/SystemHealth";
import UserManagement from "@/components/UserManagement";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your application performance and manage data</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                alt="User avatar" 
                className="w-10 h-10 rounded-full border-2 border-gray-200"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">John Developer</p>
                <p className="text-xs text-gray-500">Full Stack Engineer</p>
              </div>
            </div>
          </div>
        </header>

        <StatsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentActivity />
          <SystemHealth />
        </div>

        <UserManagement />
      </main>
    </div>
  );
}
