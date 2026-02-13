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
  getMonthlyAttendance,
  initializeStorage,
  type User,
  type AttendanceRecord,
} from "@/lib/storage";
import { CheckCircle2, Home, Calendar, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendanceHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
  }, [router]);

  useEffect(() => {
    if (user) {
      const records = getMonthlyAttendance(user.id, selectedYear, selectedMonth);
      setAttendance(records.sort((a, b) => b.date.localeCompare(a.date)));
    }
  }, [user, selectedMonth, selectedYear]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = [2024, 2025, 2026];

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

  // Calculate summary stats
  const summary = {
    present: attendance.filter((a) => a.status === "present").length,
    wfh: attendance.filter((a) => a.status === "wfh").length,
    leave: attendance.filter((a) => a.status === "leave").length,
    total: attendance.length,
  };

  return (
    <DashboardLayout user={user} activeTab="attendance">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Attendance History
          </h1>
          <p className="text-muted-foreground mt-1">
            View your monthly attendance records
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-28 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {summary.total}
                </p>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              {months[selectedMonth]} {selectedYear}
            </CardTitle>
            <CardDescription>
              Detailed attendance records for the selected month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Day</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Check In</TableHead>
                      <TableHead className="text-muted-foreground">Check Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => {
                      const date = new Date(record.date);
                      return (
                        <TableRow key={record.id} className="border-border">
                          <TableCell className="text-foreground font-medium">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
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
                No attendance records found for this month.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
