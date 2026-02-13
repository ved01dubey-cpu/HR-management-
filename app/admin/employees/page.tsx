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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  getCurrentUser,
  getUsers,
  filterAttendanceRecords,
  initializeStorage,
  type User,
  type AttendanceRecord,
} from "@/lib/storage";
import { fetchEmployees, createEmployee, deleteEmployee } from "@/lib/api";
import {
  Search,
  CheckCircle2,
  Home,
  Calendar,
  XCircle,
  Users,
  Plus,
  Trash2,
  Eye,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeRecordsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewedEmployee, setViewedEmployee] = useState<User | null>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<User>>({
    name: "",
    email: "",
    department: "",
    password: "",
    phoneNumber: "",
    address: "",
    joiningDate: "",
    employmentType: "Full-time",
    salary: "",
    manager: "",
    status: "Active",
  });

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

    // Initial fetch from backend
    loadEmployees();
  }, [router]);

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      // Fallback to local storage for demo if backend fails or is empty initially?
      // No, let's Stick to API or empty state to avoid confusion.
    }
  };

  useEffect(() => {
    const records = filterAttendanceRecords(
      selectedEmployee === "all" ? undefined : selectedEmployee,
      startDate || undefined,
      endDate || undefined
    );
    setAttendance(records);
  }, [selectedEmployee, startDate, endDate]);

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) return;

    try {
      await createEmployee({
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department || "General",
        role: "employee",
        password: newEmployee.password,
        phone: newEmployee.phoneNumber, // Note: backend expects 'phone', UI uses 'phoneNumber'
        address: newEmployee.address,
        joiningDate: newEmployee.joiningDate,
        employmentType: newEmployee.employmentType,
        salary: newEmployee.salary,
        manager: newEmployee.manager,
        status: newEmployee.status,
      });

      await loadEmployees(); // Reload list
      setIsAddOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        department: "",
        password: "",
        phoneNumber: "",
        address: "",
        joiningDate: "",
        employmentType: "Full-time",
        salary: "",
        manager: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Failed to add employee:", error);
      alert("Failed to create employee. Please check console.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      try {
        await deleteEmployee(userId);
        await loadEmployees(); // Reload list
      } catch (error) {
        console.error("Failed to delete employee:", error);
        alert("Failed to delete employee.");
      }
    }
  };

  const handleViewEmployee = (employee: User) => {
    setViewedEmployee(employee);
    setIsViewOpen(true);
  };

  // Summary stats
  const summary = {
    present: attendance.filter((a) => a.status === "present").length,
    wfh: attendance.filter((a) => a.status === "wfh").length,
    leave: attendance.filter((a) => a.status === "leave").length,
    total: attendance.length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} activeTab="employees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Employee Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage employees and view attendance records
            </p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee profile. Fill in all the details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      placeholder="******"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newEmployee.phoneNumber}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newEmployee.address}
                        onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                        placeholder="123 Main St, City"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={newEmployee.joiningDate}
                        onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select
                        value={newEmployee.employmentType}
                        onValueChange={(val) => setNewEmployee({ ...newEmployee, employmentType: val as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Intern">Intern</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                        placeholder="$50,000 / year"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager">Reporting Manager</Label>
                      <Input
                        id="manager"
                        value={newEmployee.manager}
                        onChange={(e) => setNewEmployee({ ...newEmployee, manager: e.target.value })}
                        placeholder="Manager Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newEmployee.status}
                        onValueChange={(val) => setNewEmployee({ ...newEmployee, status: val as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Resigned">Resigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Create Profilie</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Employee Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Employee Profile</DialogTitle>
                <DialogDescription>
                  Detailed 360° view of the employee record.
                </DialogDescription>
              </DialogHeader>
              {viewedEmployee && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="flex items-center gap-4 pb-6 border-b">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                      {viewedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{viewedEmployee.name}</h2>
                      <p className="text-muted-foreground">{viewedEmployee.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          ID: {viewedEmployee.id}
                        </span>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                          viewedEmployee.status === 'Resigned' ? "bg-red-100 text-red-700" :
                            viewedEmployee.status === 'On Leave' ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                        )}>
                          {viewedEmployee.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                      <p className="font-medium">{viewedEmployee.department || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                      <p className="font-medium capitalize">{viewedEmployee.role}</p>
                    </div>

                    {/* Personal Info */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                      <p className="font-medium">{viewedEmployee.phoneNumber || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                      <p className="font-medium">{viewedEmployee.address || '-'}</p>
                    </div>

                    {/* Employment Info */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Joining Date</h3>
                      <p className="font-medium">{viewedEmployee.joiningDate || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Employment Type</h3>
                      <p className="font-medium">{viewedEmployee.employmentType || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Salary</h3>
                      <p className="font-medium">{viewedEmployee.salary || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Reporting Manager</h3>
                      <p className="font-medium">{viewedEmployee.manager || '-'}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Resume.pdf</span>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Offer_Letter.pdf</span>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">ID_Proof.jpg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList>
            <TabsTrigger value="employees">Employees List</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
                <CardDescription>
                  Manage your organization's workforce ({employees.length} employees)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length > 0 ? (
                      employees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {emp.id}</div>
                          </TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                              emp.status === 'Resigned' ? "bg-red-100 text-red-700" :
                                emp.status === 'On Leave' ? "bg-yellow-100 text-yellow-700" :
                                  "bg-green-100 text-green-700"
                            )}>
                              {emp.status || 'Active'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => handleViewEmployee(emp)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(emp.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No employees found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6 mt-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
