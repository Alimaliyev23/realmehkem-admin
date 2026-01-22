import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/api";

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

export type EmployeeCreateInput = Omit<Employee, "id"> & { id?: string };
export type EmployeeUpdateInput = Omit<Employee, "id">;

export function getEmployees() {
  return apiGet<Employee[]>("/employees");
}

export function getEmployee(id: string) {
  return apiGet<Employee>(`/employees/${id}`);
}

export function createEmployee(data: EmployeeCreateInput) {
  return apiPost<EmployeeCreateInput, Employee>("/employees", data);
}

export function updateEmployee(id: string, data: EmployeeUpdateInput) {
  return apiPut<EmployeeUpdateInput, Employee>(`/employees/${id}`, data);
}

export function deleteEmployee(id: string) {
  return apiDelete(`/employees/${id}`);
}
