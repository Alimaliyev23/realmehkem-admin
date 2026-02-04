export type LeaveType = "annual" | "sick" | "unpaid" | "business" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRequestApi = {
  id: string;
  employeeId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  note?: string;
};

export type LeaveRequestRow = {
  id: string;
  employeeId: number;
  employeeName: string;

  storeId: number | null;
  storeName: string;

  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  note?: string;
};
