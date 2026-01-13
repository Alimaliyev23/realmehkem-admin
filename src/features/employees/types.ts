export type EmployeeStatus = "active" | "on_leave" | "terminated";

export type Salary = {
  currency: string;
  base: number;
  bonus: number;
};

export type EmployeeApi = {
  id: number; // ✅ json-server NUMBER qaytarır
  companyId: number;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  storeId: number | null;
  roleId: number;
  managerId: number | null;
  status: EmployeeStatus;
  hireDate: string; // API-də hireDate gəlir
  salary: Salary;
};

export type DepartmentApi = {
  id: number;
  companyId: number;
  name: string;
  code: string;
};
export type StoreApi = {
  id: number;
  companyId: number;
  name: string;
  code: string;
  address: string;
};
export type RoleApi = { id: number; name: string };

export type EmployeeRow = {
  id: number; // ✅ DataTable row key üçün
  fullName: string;
  department: string; // ✅ ad olaraq göstəririk
  storeName?: string;
  role: string; // ✅ ad olaraq göstəririk
  salary: Salary;
  hiredAt: string;
  status: EmployeeStatus;
};
