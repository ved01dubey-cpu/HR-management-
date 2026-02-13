// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department: string;
  password: string;
  // Extended Profile
  phoneNumber?: string;
  address?: string;
  joiningDate?: string;
  employmentType?: 'Full-time' | 'Intern' | 'Contract';
  salary?: string;
  manager?: string;
  status?: 'Active' | 'On Leave' | 'Resigned';
  documents?: {
    resume?: string;
    offerLetter?: string;
    idProof?: string;
  };
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: 'present' | 'wfh' | 'leave' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: 'sick' | 'casual' | 'annual' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'attendance_users_v2',
  ATTENDANCE: 'attendance_records',
  LEAVE_REQUESTS: 'leave_requests',
  CURRENT_USER: 'current_user',
};

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@hr.com',
    role: 'admin',
    department: 'HR',
    password: 'Admin@123',
  },
];

export function addUser(user: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = { ...user, id: Date.now().toString() };
  users.push(newUser);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  return newUser;
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

// Generate mock attendance for past 30 days
function generateMockAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['present', 'wfh', 'leave', 'present', 'present'];

  mockUsers.forEach(user => {
    if (user.role === 'employee') {
      for (let i = 30; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        records.push({
          id: `att_${user.id}_${date.toISOString().split('T')[0]}`,
          userId: user.id,
          date: date.toISOString().split('T')[0],
          status,
          checkInTime: status !== 'leave' ? '09:00' : undefined,
          checkOutTime: status !== 'leave' ? '18:00' : undefined,
        });
      }
    }
  });

  return records;
}

// Generate mock leave requests
function generateMockLeaveRequests(): LeaveRequest[] {
  return [];
}

// Initialize storage with mock data
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateMockAttendance()));
  }

  if (!localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(generateMockLeaveRequests()));
  }
}

// User functions
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function authenticateUser(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function logout(): void {
  setCurrentUser(null);
}

// Attendance functions
export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
}

export function getAttendanceByUser(userId: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(r => r.userId === userId);
}

export function getTodayAttendance(userId: string): AttendanceRecord | undefined {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceRecords().find(r => r.userId === userId && r.date === today);
}

export function markAttendance(
  userId: string,
  status: AttendanceRecord['status']
): AttendanceRecord {
  const records = getAttendanceRecords();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Check if already marked today
  const existingIndex = records.findIndex(r => r.userId === userId && r.date === today);

  const newRecord: AttendanceRecord = {
    id: `att_${userId}_${today}`,
    userId,
    date: today,
    status,
    checkInTime: status !== 'leave' ? now : undefined,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = newRecord;
  } else {
    records.push(newRecord);
  }

  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  return newRecord;
}

export function getMonthlyAttendance(userId: string, year: number, month: number): AttendanceRecord[] {
  const records = getAttendanceByUser(userId);
  return records.filter(r => {
    const date = new Date(r.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

// Leave request functions
export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function getLeaveRequestsByUser(userId: string): LeaveRequest[] {
  return getLeaveRequests().filter(r => r.userId === userId);
}

export function createLeaveRequest(
  userId: string,
  leaveType: LeaveRequest['leaveType'],
  startDate: string,
  endDate: string,
  reason: string
): LeaveRequest {
  const requests = getLeaveRequests();

  const newRequest: LeaveRequest = {
    id: `leave_${Date.now()}`,
    userId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
  return newRequest;
}

export function updateLeaveRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewerId: string
): LeaveRequest | null {
  const requests = getLeaveRequests();
  const index = requests.findIndex(r => r.id === requestId);

  if (index >= 0) {
    requests[index] = {
      ...requests[index],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
    };
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }

  return null;
}

// Filter functions for admin
export function filterAttendanceRecords(
  employeeId?: string,
  startDate?: string,
  endDate?: string
): AttendanceRecord[] {
  let records = getAttendanceRecords();

  if (employeeId) {
    records = records.filter(r => r.userId === employeeId);
  }

  if (startDate) {
    records = records.filter(r => r.date >= startDate);
  }

  if (endDate) {
    records = records.filter(r => r.date <= endDate);
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export function filterLeaveRequests(
  employeeId?: string,
  status?: LeaveRequest['status']
): LeaveRequest[] {
  let requests = getLeaveRequests();

  if (employeeId) {
    requests = requests.filter(r => r.userId === employeeId);
  }

  if (status) {
    requests = requests.filter(r => r.status === status);
  }

  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
