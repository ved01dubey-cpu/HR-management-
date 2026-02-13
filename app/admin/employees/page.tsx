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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCurrentUser,
  getUsers,
  filterAttendanceRecords,
  initializeStorage,
  type User,
  type AttendanceRecord,
} from "@/lib/storage";
import {
  Search,
  CheckCircle2,
  Home,
  Calendar,
  XCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeRecordsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    const records = filterAttendanceRecords(
      selectedEmployee === "all" ? undefined : selectedEmployee,
      startDate || undefined,
      endDate || undefined
    );
    setAttendance(records);
  }, [selectedEmployee, startDate, endDate]);

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
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "wfh":
        return <Home className="h-4 w-4 text-primary" />;
      case "leave":
        return <Calendar className="h-4 w-4 text-warning" />;
      default:
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: "bg-success/10 text-success",
      wfh: "bg-primary/10 text-primary",
      leave: "bg-warning/10 text-warning",
      absent: "bg-destructive/10 text-destructive",
    };
    const labels = {
      present: "Present",
      wfh: "WFH",
      leave: "Leave",
      absent: "Absent",
    };
    return (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          styles[status as keyof typeof styles] || styles.absent
        )}
      >
        {labels[status as keyof typeof labels] || "Absent"}
      </span>
    );
  };

  // Summary stats
  const summary = {
    present: attendance.filter((a) => a.status === "present").length,
    wfh: attendance.filter((a) => a.status === "wfh").length,
    leave: attendance.filter((a) => a.status === "leave").length,
    total: attendance.length,
  };

  return (
    <DashboardLayout user={user} activeTab="employees">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Employee Attendance Records
          </h1>
          <p className="text-muted-foreground mt-1">
            View and filter all employee attendance data
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="text-sm text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.present}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.wfh}
                </p>
                <p className="text-xs text-muted-foreground">Work From Home</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.leave}
                </p>
                <p className="text-xs text-muted-foreground">On Leave</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.total}
                </p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Attendance Records
            </CardTitle>
            <CardDescription>
              {selectedEmployee === "all"
                ? "Showing all employee records"
                : `Showing records for ${getUserName(selectedEmployee)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Employee</TableHead>
                      <TableHead className="text-muted-foreground">Department</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Check In</TableHead>
                      <TableHead className="text-muted-foreground">Check Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.slice(0, 50).map((record) => {
                      const date = new Date(record.date);
                      return (
                        <TableRow key={record.id} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                                {getUserName(record.userId).charAt(0)}
                              </div>
                              <span className="font-medium text-foreground">
                                {getUserName(record.userId)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {getUserDepartment(record.userId)}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(record.status)}
                              {getStatusBadge(record.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.checkInTime || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.checkOutTime || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No attendance records found for the selected filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
