"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentUser,
  getUsers,
  getAttendanceRecords,
  getLeaveRequests,
  initializeStorage,
  type User,
  type AttendanceRecord,
  type LeaveRequest,
} from "@/lib/storage";
import {
  Users,
  CheckCircle2,
  Home,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const router = useRouter();

  useEffect(() => {
    initializeStorage();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (currentUser.role !== "admin") {
      router.push("/employee");
      return;
    }
    setUser(currentUser);

    // Load data
    const allUsers = getUsers().filter((u) => u.role === "employee");
    setEmployees(allUsers);

    const today = new Date().toISOString().split("T")[0];
    const allAttendance = getAttendanceRecords();
    setTodayAttendance(allAttendance.filter((a) => a.date === today));

    const allLeaves = getLeaveRequests();
    setPendingLeaves(allLeaves.filter((l) => l.status === "pending"));
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate today's stats
  const todayStats = {
    present: todayAttendance.filter((a) => a.status === "present").length,
    wfh: todayAttendance.filter((a) => a.status === "wfh").length,
    leave: todayAttendance.filter((a) => a.status === "leave").length,
    notMarked: employees.length - todayAttendance.length,
  };

  const getUserName = (userId: string) => {
    const emp = employees.find((e) => e.id === userId);
    return emp?.name || "Unknown";
  };

  const getUserDepartment = (userId: string) => {
    const emp = employees.find((e) => e.id === userId);
    return emp?.department || "";
  };

  return (
    <DashboardLayout user={user} activeTab="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">{formattedDate}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {employees.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {todayStats.present}
                  </p>
                  <p className="text-xs text-muted-foreground">Present Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {todayStats.wfh}
                  </p>
                  <p className="text-xs text-muted-foreground">Working From Home</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {pendingLeaves.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Leaves</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Attendance */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-card-foreground">
                  Today's Attendance
                </CardTitle>
                <CardDescription>
                  Real-time attendance status
                </CardDescription>
              </div>
              <Link href="/admin/employees">
                <Button variant="outline" size="sm" className="border-border bg-transparent">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todayAttendance.length > 0 ? (
                <div className="space-y-3">
                  {todayAttendance.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                          {getUserName(record.userId).charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {getUserName(record.userId)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getUserDepartment(record.userId)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.status === "present"
                            ? "bg-success/10 text-success"
                            : record.status === "wfh"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {record.status === "present"
                          ? "Present"
                          : record.status === "wfh"
                          ? "WFH"
                          : "Leave"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No attendance marked today yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Leave Requests */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-card-foreground">
                  Pending Leave Requests
                </CardTitle>
                <CardDescription>
                  Requests awaiting approval
                </CardDescription>
              </div>
              <Link href="/admin/leave">
                <Button variant="outline" size="sm" className="border-border bg-transparent">
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length > 0 ? (
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                          <FileText className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {getUserName(request.userId)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {request.leaveType} Leave
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {request.startDate !== request.endDate && (
                            <>
                              {" - "}
                              {new Date(request.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No pending leave requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
