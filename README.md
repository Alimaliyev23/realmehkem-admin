# Realmehkem Admin

### HR & Administrative Management Panel

**Realmehkem Admin** — filial və rol əsaslı strukturla çalışan müəssisələr üçün hazırlanmış
**HR və inzibati idarəetmə panelidir**.

Layihənin əsas məqsədi:

- insan resurslarının mərkəzləşdirilmiş idarə olunması,
- HR proseslərinin (əməkdaş, məzuniyyət, elan, audit və s.) rəqəmsallaşdırılması,
- fərqli istifadəçi rolları üçün təhlükəsiz və nəzarətli iş axınının təmin edilməsidir.

Bu layihə **real HR workflow**-lara uyğun olaraq dizayn edilmiş və
portfolio + praktiki istifadə üçün nəzərdə tutulmuşdur.

---

## 🎯 Layihənin Məqsədi

Realmehkem Admin aşağıdakı problemləri həll etməyə yönəlib:

- HR və Admin əməliyyatlarının **vahid platformada** idarə edilməsi
- Filiallara görə **icazələrin məhdudlaşdırılması**
- HR qərarlarının (məs: məzuniyyət təsdiqi) **izlənilə bilən və audit-lənən** olması
- Manual proseslərin minimuma endirilməsi və **operativ qərarvermə**

---

## 🧩 Əsas Funksional İmkanlar

### 🔐 İstifadəçi Rolları və Təhlükəsizlik

- **Admin** – tam idarəetmə səlahiyyəti
- **HR** – əməkdaş və HR proseslərinin idarəsi
- **Store Manager** – yalnız öz filialına aid məlumatlara baxış

Role-based access control bütün səhifələrdə tətbiq olunur.

---

### 👥 Əməkdaşların İdarə Edilməsi (Employees)

- Əməkdaş siyahısı
- Axtarış və filterləmə
- Yeni əməkdaş əlavə etmə
- Məlumatların yenilənməsi
- Silmə (rol icazələrinə uyğun)
- Filiala görə görünürlük məhdudiyyəti

---

### 📝 Məzuniyyət və İcazə Sistemi (Leave Requests)

- Məzuniyyət sorğularının yaradılması
- HR/Admin tərəfindən **təsdiq / rədd** mexanizmi
- Status əsaslı izləmə (`pending`, `approved`, `rejected`)
- Tarix aralığına görə avtomatik gün hesablanması
- Bütün dəyişikliklərin audit log-larda saxlanılması

Bu modul real HR approval workflow prinsiplərinə əsaslanır.

---

### 📢 Elanlar (Announcements)

- HR/Admin tərəfindən elanların yaradılması
- İstifadəçilər üçün mərkəzləşdirilmiş məlumat axını

---

### 🧾 Audit Log Sistemi

- Sistemdə edilən bütün əsas əməliyyatlar qeydə alınır:
  - create / update / delete
  - status dəyişiklikləri
- Şəffaflıq və nəzarət məqsədi daşıyır

---

### 🔔 Bildiriş Sistemi (Toast Notifications)

- İstifadəçi əməliyyatlarına dərhal vizual geri dönüş
- Uğurlu və uğursuz əməliyyatlar üçün bildirişlər
- İcazə pozuntuları zamanı xəbərdarlıq
- HR qərarları (məzuniyyət təsdiqi/rəddi) barədə məlumat

Bildirişlər **dark / light mode** ilə tam uyğundur.

---

### 🌗 Dark / Light Mode

- Manual rejim dəyişimi
- Seçilmiş tema local storage-da saxlanılır
- Bütün UI komponentləri (modal, toast, table) temaya uyğun işləyir
- Uzunmüddətli istifadə üçün rahat UX təmin edir

---

## ⚙️ İstifadə Olunan Texnologiyalar

### Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **React Router**
- **TailwindCSS**
- **TanStack React Table**
- **Recharts**
- **React-Toastify**

### Backend (Mock API)

- **json-server**
- In-memory data storage (`server/db.json`)

> Qeyd: Backend demo məqsədlidir. Server restart edildikdə məlumatlar sıfırlanır.

---

## 🚀 Local Setup

### Tələblər

- **Node.js 20.x**

### Quraşdırma

```bash
git clone https://github.com/Alimaliyev23/realmehkem-admin.git
cd realmehkem-admin
npm install
```
