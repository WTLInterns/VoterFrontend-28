export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age?: number | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  paid: boolean;
  paidDate: string | null;
  paidBy: string | null;
  amount?: number | null;
  createdBy: string | null; // Sub-admin who created this voter
  vidhansabhaNo: string | null; // Assembly Constituency Number
  vibhaghKramank: string | null; // Division/Section Number
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  status: 'active' | 'blocked';
  interfaceStatus: number; // 1 = Money Distribution, 2 = Issue Reporting
  lastLocation: string;
  paymentsToday: number;
  totalPayments: number;
  latitude: number; // Changed from lat to latitude to match backend
  longitude: number; // Changed from lng to longitude to match backend
  createdBy: string | null; // Sub-admin who created this agent
  lastUpdated?: string; // Last location update timestamp
  username?: string; // For backward compatibility
}

export interface Administrator {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  role: 'admin' | 'supervisor' | 'master';
  status: 'active' | 'blocked';
  createdDate: string;
  totalPayments: number;
}

export interface Transaction {
  id: string;
  userId: number;
  agentId: string;
  amount: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  date: string; // For display purposes
  userName: string; // User's full name
  userFirstName?: string; // User's first name
  userLastName?: string; // User's last name
  paymentMethod?: string; // Payment method used
  // Agent information
  agentFirstName?: string; // Agent's first name
  agentLastName?: string; // Agent's last name
  // Legacy properties for backward compatibility
  user?: string;
  agent?: string;
  timestamp?: string;
}

export interface LocationHistory {
  id: number;
  agentId: string;
  location: string;
  latitude: number;
  longitude: number;
  action?: string;
  timestamp: string;
}

export interface LoginLog {
  timestamp: string;
  user: string;
  role: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

export interface SystemSettings {
  defaultPaymentAmount: number;
  sessionTimeout: number;
  trackingInterval?: number;
  offlineThreshold?: number;
  maxFileSize?: number;
  supportedFormats?: string[];
  emailNotifications?: boolean;
  autoBackup?: boolean;
}

export type UserRole = 'admin' | 'master' | 'agent';

export interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateProfile?: (userData: Partial<AuthUser>) => void;
  loading: boolean;
}

export interface AppState {
  users: User[];
  agents: Agent[];
  administrators: Administrator[];
  transactions: Transaction[];
  locationHistory: LocationHistory[];
  loginLogs: LoginLog[];
  blockedAgents: Set<string>;
  systemSettings: SystemSettings;
}

export interface DashboardStats {
  totalPaid: number;
  totalAmount: number;
  activeAgents: number;
  totalUsers: number;
  totalAdmins?: number;
  totalTransactions?: number;
}

export interface StatusBadgeProps {
  status: 'active' | 'blocked' | 'paid' | 'pending' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  min?: string;
  max?: string;
}

export interface Issue {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  agentId: string;
  agentName: string;
  agentFirstName?: string;
  agentLastName?: string;
  agentPhone?: string;
  submissionDate: string;
  resolutionDate?: string;
  address?: string;
  area?: string;
  village?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  attachments: Array<{
    id: string;
    type: 'IMAGE' | 'VIDEO';
    url: string;
    filename: string;
  }>;
  comments: Array<{
    id: string;
    comment: string;
    createdAt: string;
    createdBy: string;
  }>;
}
