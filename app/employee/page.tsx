"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentUser,
  getTodayAttendance,
  markAttendance,
  getLeaveRequestsByUser,
  initializeStorage,
  type User,
  type AttendanceRecord,
  type LeaveRequest,
} from "@/lib/storage";
import {
  CheckCircle2,
  Home,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | undefined>();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initializeStorage();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (currentUser.role !== "employee") {
      router.push("/admin");
      return;
    }
    setUser(currentUser);
    setTodayAttendance(getTodayAttendance(currentUser.id));
    setPendingLeaves(
      getLeaveRequestsByUser(currentUser.id).filter((l) => l.status === "pending")
    );
  }, [router]);

  const handleMarkAttendance = async (status: AttendanceRecord["status"]) => {
    if (!user) return;
    setIsMarking(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const record = markAttendance(user.id, status);
    setTodayAttendance(record);
    setIsMarking(false);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-success bg-success/10";
      case "wfh":
        return "text-primary bg-primary/10";
      case "leave":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Present";
      case "wfh":
        return "Work From Home";
      case "leave":
        return "On Leave";
      default:
        return "Not Marked";
    }
  };

  return (
    <DashboardLayout user={user} activeTab="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">{formattedDate}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Status</p>
                  <p
                    className={cn(
                      "font-medium",
                      todayAttendance ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {todayAttendance
                      ? getStatusLabel(todayAttendance.status)
                      : "Not Marked"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Leaves</p>
                  <p className="font-medium text-foreground">
                    {pendingLeaves.length} request{pendingLeaves.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{user.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mark Attendance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Mark Today's Attendance
            </CardTitle>
            <CardDescription>
              Select your attendance status for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAttendance ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    getStatusColor(todayAttendance.status)
                  )}
                >
                  {todayAttendance.status === "present" && (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  {todayAttendance.status === "wfh" && <Home className="h-5 w-5" />}
                  {todayAttendance.status === "leave" && (
                    <Calendar className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Attendance marked as {getStatusLabel(todayAttendance.status)}
                  </p>
                  {todayAttendance.checkInTime && (
                    <p className="text-sm text-muted-foreground">
                      Checked in at {todayAttendance.checkInTime}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleMarkAttendance("present")}
                  disabled={isMarking}
                  className="h-20 flex flex-col gap-2 bg-success/10 hover:bg-success/20 text-success border border-success/20"
                  variant="outline"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="font-medium">Present</span>
                </Button>
                <Button
                  onClick={() => handleMarkAttendance("wfh")}
                  disabled={isMarking}
                  className="h-20 flex flex-col gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                  variant="outline"
                >
                  <Home className="h-6 w-6" />
                  <span className="font-medium">Work From Home</span>
                </Button>
                <Button
                  onClick={() => handleMarkAttendance("leave")}
                  disabled={isMarking}
                  className="h-20 flex flex-col gap-2 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  <span className="font-medium">Leave</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        {pendingLeaves.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {leave.leaveType} Leave
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
