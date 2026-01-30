// src/features/audit/auditFormatters.ts

export const actionLabels: Record<string, string> = {
  "employee.create": "Əməkdaş əlavə edildi",
  "employee.update": "Əməkdaş yeniləndi",
  "employee.delete": "Əməkdaş silindi",

  "announcement.create": "Elan yaradıldı",
  "announcement.update": "Elan yeniləndi",
  "announcement.delete": "Elan silindi",
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

  return JSON.stringify(meta);
}
