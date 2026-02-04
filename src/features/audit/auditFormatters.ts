// src/features/audit/auditFormatters.ts

export const actionLabels: Record<string, string> = {
  "employee.create": "Əməkdaş əlavə edildi",
  "employee.update": "Əməkdaş yeniləndi",
  "employee.delete": "Əməkdaş silindi",

  "announcement.create": "Elan yaradıldı",
  "announcement.update": "Elan yeniləndi",
  "announcement.delete": "Elan silindi",

  "leaveRequest.create": "Məzuniyyət sorğusu yaradıldı",
  "leaveRequest.update": "Məzuniyyət sorğusu yeniləndi",
  "leaveRequest.approve": "Məzuniyyət sorğusu təsdiqləndi",
  "leaveRequest.reject": "Məzuniyyət sorğusu rədd edildi",

  "leave.create": "Məzuniyyət sorğusu yaradıldı",
  "leave.update": "Məzuniyyət sorğusu yeniləndi",
  "leave.delete": "Məzuniyyət sorğusu silindi",
  "leave.status": "Məzuniyyət statusu dəyişdi",

  "payroll.create": "Əməkhaqqı qeydiyyatı yaradıldı",
  "payroll.update": "Əməkhaqqı qeydiyyatı yeniləndi",
  "payroll.delete": "Əməkhaqqı qeydiyyatı silindi",

  "attendance.create": "Davamiyyət əlavə edildi",
  "attendance.update": "Davamiyyət yeniləndi",
  "attendance.delete": "Davamiyyət silindi",

  "performanceReview.create": "Qiymətləndirmə yaradıldı",
  "performanceReview.update": "Qiymətləndirmə yeniləndi",
  "performanceReview.delete": "Qiymətləndirmə silindi",

  "asset.assign": "Əmlak əməkdaşa təhkim edildi",
  "asset.return": "Əmlak geri qaytarıldı",
};

export function formatAuditMeta(meta?: Record<string, any>) {
  if (!meta) return "—";

  if (meta.fullName && meta.changed) {
    const fieldMap: Record<string, string> = {
      "salary.base": "Əmək haqqı",
      "salary.bonus": "Bonus",
      status: "Status",
      roleId: "Vəzifə",
      departmentId: "Şöbə",
      storeId: "Filial",
    };

    const changed = meta.changed
      .map((k: string) => fieldMap[k] ?? k)
      .join(", ");

    return `Ad: ${meta.fullName}, dəyişənlər: ${changed}`;
  }

  if (meta.title && meta.changed) {
    const fieldMap: Record<string, string> = {
      title: "Başlıq",
      content: "Mətn",
      audience: "Hədəf qrup",
    };

    const changed = meta.changed
      .map((k: string) => fieldMap[k] ?? k)
      .join(", ");

    return `Elan: ${meta.title}, dəyişənlər: ${changed}`;
  }

  if (meta.fullName) return `Ad: ${meta.fullName}`;
  if (meta.title) return `Elan: ${meta.title}`;

  const keyMap: Record<string, string> = {
    employeeId: "Əməkdaş ID",
    storeId: "Filial",
    departmentId: "Şöbə",
    roleId: "Vəzifə",
    status: "Status",
    type: "Növ",
    month: "Ay",
    rating: "Reytinq",
    days: "Gün sayı",
    startDate: "Başlama tarixi",
    endDate: "Bitmə tarixi",
  };

  const statusMap: Record<string, string> = {
    pending: "Gözləmədə",
    approved: "Təsdiqləndi",
    rejected: "Rədd edildi",
    active: "Aktiv",
    on_leave: "Məzuniyyətdə",
    terminated: "İşdən çıxıb",
    present: "İştirak edib",
    late: "Gecikib",
    early_leave: "Erkən çıxıb",
    draft: "Qaralama",
    paid: "Ödənilib",
  };

  const parts = Object.entries(meta).map(([k, v]) => {
    const label = keyMap[k] ?? k;
    const value =
      typeof v === "string" && statusMap[v] ? statusMap[v] : JSON.stringify(v);
    return `${label}: ${value.replace(/^"|"$/g, "")}`;
  });

  return parts.join(", ");
}
