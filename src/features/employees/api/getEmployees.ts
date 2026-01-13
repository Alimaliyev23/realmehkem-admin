import { apiGet } from "../../../lib/api";

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  storeId: string | null;
  role: string;
  position: string;
  status: "active" | "terminated";
  salary: number;
  hireDate: string;
  managerId?: string;
};

export function getEmployees() {
  return apiGet<Employee[]>("/employees");
}
