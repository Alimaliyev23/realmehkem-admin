import type { EmployeeApi, EmployeeStatus, Salary } from "../employees/types";

export type EmployeeFormState = {
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  storeId: string; 
  roleId: string;
  managerId: string; 
  status: EmployeeStatus;
  hireDate: string;
  salaryBase: string;
  salaryCurrency: string;
  salaryBonus: string;
};

export function toFormState(e?: EmployeeApi): EmployeeFormState {
  return {
    fullName: e?.fullName ?? "",
    email: e?.email ?? "",
    phone: e?.phone ?? "",
    departmentId: e ? String(e.departmentId) : "",
    storeId: e?.storeId != null ? String(e.storeId) : "",
    roleId: e ? String(e.roleId) : "",
    managerId: e?.managerId != null ? String(e.managerId) : "",
    status: e?.status ?? "active",
    hireDate: e?.hireDate ?? "",
    salaryBase: e?.salary?.base != null ? String(e.salary.base) : "0",
    salaryCurrency: e?.salary?.currency ?? "AZN",
    salaryBonus: e?.salary?.bonus != null ? String(e.salary.bonus) : "0",
  };
}

export function toApiPayload(
  form: EmployeeFormState,
  current?: EmployeeApi,
): Omit<EmployeeApi, "id"> {
  const salary: Salary = {
    currency: form.salaryCurrency || "AZN",
    base: Number(form.salaryBase || 0),
    bonus: Number(form.salaryBonus || 0),
  };

  return {
    companyId: current?.companyId ?? 1,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    departmentId: Number(form.departmentId),
    storeId: form.storeId ? Number(form.storeId) : null,
    roleId: Number(form.roleId),
    managerId: form.managerId ? Number(form.managerId) : null,
    status: form.status,
    hireDate: form.hireDate,
    salary,
  };
}
