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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrentUser,
  getUsers,
  filterLeaveRequests,
  updateLeaveRequestStatus,
  initializeStorage,
  type User,
  type LeaveRequest,
} from "@/lib/storage";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeaveManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
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

    const allUsers = getUsers().filter((u) => u.role === "employee");
    setEmployees(allUsers);
  }, [router]);

  useEffect(() => {
    loadLeaveRequests();
  }, [selectedEmployee, selectedStatus]);

  const loadLeaveRequests = () => {
    const requests = filterLeaveRequests(
      selectedEmployee === "all" ? undefined : selectedEmployee,
      selectedStatus === "all" ? undefined : (selectedStatus as LeaveRequest["status"])
    );
    setLeaveRequests(requests);
  };

  const handleStatusUpdate = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    if (!user) return;
    setIsUpdating(requestId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateLeaveRequestStatus(requestId, status, user.id);
    loadLeaveRequests();
    setIsUpdating(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getUserName = (userId: string) => {
    const emp = employees.find((e) => e.id === userId);
    return emp?.name || "Unknown";
  };

  const getUserDepartment = (userId: string) => {
    const emp = employees.find((e) => e.id === userId);
    return emp?.department || "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      rejected: "bg-destructive/10 text-destructive",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
          styles[status as keyof typeof styles]
        )}
      >
        {status}
      </span>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
    };
    return labels[type] || type;
  };

  // Summary stats
  const allRequests = filterLeaveRequests();
  const summary = {
    pending: allRequests.filter((l) => l.status === "pending").length,
    approved: allRequests.filter((l) => l.status === "approved").length,
    rejected: allRequests.filter((l) => l.status === "rejected").length,
  };

  return (
    <DashboardLayout user={user} activeTab="leave">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage employee leave requests
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.approved}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.rejected}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Employee</label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Leave Requests
            </CardTitle>
            <CardDescription>
              {leaveRequests.length} request{leaveRequests.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaveRequests.length > 0 ? (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium flex-shrink-0">
                          {getUserName(request.userId).charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground">
                              {getUserName(request.userId)}
                            </p>
                            <span className="text-muted-foreground">·</span>
                            <p className="text-sm text-muted-foreground">
                              {getUserDepartment(request.userId)}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {getLeaveTypeLabel(request.leaveType)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(request.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              -{" "}
                              {new Date(request.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium text-foreground/80">Reason: </span>
                            {request.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, "approved")}
                              disabled={isUpdating === request.id}
                              className="bg-success/10 hover:bg-success/20 text-success border border-success/20"
                              variant="outline"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, "rejected")}
                              disabled={isUpdating === request.id}
                              className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
                              variant="outline"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Applied{" "}
                          {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No leave requests found for the selected filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
