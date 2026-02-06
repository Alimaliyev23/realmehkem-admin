Realmehkem Admin
HR & Administrative Management Panel

Realmehkem Admin — filial və rol əsaslı strukturla çalışan müəssisələr üçün hazırlanmış
HR və inzibati idarəetmə panelidir.

Layihənin əsas məqsədi:

insan resurslarının mərkəzləşdirilmiş idarə olunması,

HR proseslərinin (əməkdaş, məzuniyyət, elan, audit və s.) rəqəmsallaşdırılması,

fərqli istifadəçi rolları üçün təhlükəsiz və nəzarətli iş axınının təmin edilməsidir.

Bu layihə real HR workflow-lara uyğun olaraq dizayn edilmiş və
portfolio + praktiki istifadə üçün nəzərdə tutulmuşdur.

🎯 Layihənin Məqsədi

Realmehkem Admin aşağıdakı problemləri həll etməyə yönəlib:

HR və Admin əməliyyatlarının vahid platformada idarə edilməsi

Filiallara görə icazələrin məhdudlaşdırılması

HR qərarlarının (məs: məzuniyyət təsdiqi) izlənilə bilən və audit-lənən olması

Manual proseslərin minimuma endirilməsi və operativ qərarvermə

🧩 Əsas Funksional İmkanlar
🔐 İstifadəçi Rolları və Təhlükəsizlik

Admin – tam idarəetmə səlahiyyəti

HR – əməkdaş və HR proseslərinin idarəsi

Store Manager – yalnız öz filialına aid məlumatlara baxış

Role-based access control bütün səhifələrdə tətbiq olunur.

👥 Əməkdaşların İdarə Edilməsi (Employees)

Əməkdaş siyahısı

Axtarış və filterləmə

Yeni əməkdaş əlavə etmə

Məlumatların yenilənməsi

Silmə (rol icazələrinə uyğun)

Filiala görə görünürlük məhdudiyyəti

📝 Məzuniyyət və İcazə Sistemi (Leave Requests)

Məzuniyyət sorğularının yaradılması

HR/Admin tərəfindən təsdiq / rədd mexanizmi

Status əsaslı izləmə (pending, approved, rejected)

Tarix aralığına görə avtomatik gün hesablanması

Bütün dəyişikliklərin audit log-larda saxlanılması

Bu modul real HR approval workflow prinsiplərinə əsaslanır.

📢 Elanlar (Announcements)

HR/Admin tərəfindən elanların yaradılması

İstifadəçilər üçün mərkəzləşdirilmiş məlumat axını

🧾 Audit Log Sistemi

Sistemdə edilən bütün əsas əməliyyatlar qeydə alınır:

create / update / delete

status dəyişiklikləri

Şəffaflıq və nəzarət məqsədi daşıyır

📤 Excel Export (HR Hesabatları)

HR və Admin istifadəçilər üçün əsas məlumatların Excel formatında ixracı mövcuddur.

Dəstəklənən export-lar:

Employees (Əməkdaşlar)
Ad Soyad, Email, əlaqə məlumatları, filial, şöbə, rol, status, işə qəbul tarixi

Leave Requests (Məzuniyyətlər)
Əməkdaş, məzuniyyət tipi, tarix aralığı, gün sayı, status, qeyd

Xüsusiyyətlər:

Backend tələb etmir (tam frontend-based)

Yalnız HR / Admin rolları üçün aktivdir

Cari filter və filial məhdudiyyətlərini nəzərə alır

Excel faylı avtomatik endirilir (.xlsx)

Bu funksiya real HR hesabat və arxiv ehtiyacları üçün nəzərdə tutulmuşdur.

🔔 Bildiriş Sistemi (Toast Notifications)

İstifadəçi əməliyyatlarına dərhal vizual geri dönüş

Uğurlu və uğursuz əməliyyatlar üçün bildirişlər

İcazə pozuntuları zamanı xəbərdarlıq

HR qərarları (məzuniyyət təsdiqi/rəddi) barədə məlumat

Bildirişlər dark / light mode ilə tam uyğundur.

🌗 Dark / Light Mode

Manual rejim dəyişimi

Seçilmiş tema local storage-da saxlanılır

Bütün UI komponentləri (modal, toast, table) temaya uyğun işləyir

Uzunmüddətli istifadə üçün rahat UX təmin edir

⚡ İlk Açılış Optimizasiyası (Cold Start Handling)

Backend demo məqsədli olduğu üçün ilk açılış zamanı server gec cavab verə bilər.

Bu problemi azaltmaq üçün:

Tətbiq açılan kimi backend-ə warm-up request göndərilir

İstifadəçiyə ilkin yükləmə barədə məlumat verilir

Sonrakı səhifə keçidləri sürətli və axıcı şəkildə işləyir

Bu yanaşma real SaaS admin panellərində istifadə olunan UX praktikasına uyğundur.

⚙️ İstifadə Olunan Texnologiyalar
Frontend

React 19

TypeScript

Vite

React Router

TailwindCSS

TanStack React Table

Recharts

React-Toastify

Backend (Mock API)

json-server

In-memory data storage (server/db.json)

Qeyd: Backend demo məqsədlidir. Server restart edildikdə məlumatlar sıfırlanır.

🚀 Local Setup
Tələblər

Node.js 20.x

Quraşdırma
git clone https://github.com/Alimaliyev23/realmehkem-admin.git
cd realmehkem-admin
npm install
npm run dev

Realmehkem Admin
HR & Administrative Management Panel

Realmehkem Admin is an HR and administrative management panel
designed for organizations operating with store-based and role-based structures.

The main goal of the project is to:

centralize human resource management,

digitize HR processes (employees, leave requests, announcements, audit logs),

provide a secure and controlled workflow for different user roles.

The project is built according to real-world HR workflows and is intended for
portfolio demonstration and practical usage.

🎯 Project Purpose

Realmehkem Admin aims to solve the following problems:

Managing HR and administrative operations on a single platform

Restricting access based on store and role

Making HR decisions (e.g. leave approvals) traceable and auditable

Reducing manual processes and enabling faster decision-making

🧩 Core Features
🔐 User Roles & Security

Admin – full system access

HR – employee and HR process management

Store Manager – view-only access limited to own store

Role-based access control is enforced across the entire application.

👥 Employee Management

Employee listing

Search and filtering

Create / update / delete employees (permission-based)

Store-level visibility restriction

📝 Leave Request Management

Leave request creation

HR/Admin approval or rejection

Status tracking (pending, approved, rejected)

Automatic leave day calculation

Full audit logging of all changes

This module follows real HR approval workflows.

📢 Announcements

Centralized announcements created by HR/Admin

Visible to all authorized users

🧾 Audit Logging

Tracks all critical system actions:

create / update / delete

status changes

Ensures transparency and accountability

📤 Excel Export (HR Reporting)

The system supports Excel export for key HR data.

Supported exports:

Employees

Leave Requests

Key characteristics:

Frontend-only (no backend processing)

Available only to HR / Admin

Respects active filters and store restrictions

Automatically downloads .xlsx files

This reflects real-world HR reporting and archival needs.

🌗 Dark / Light Mode

Manual theme switching

Theme stored in local storage

Fully consistent UI across all components

Improved long-term usability

⚡ Initial Load Optimization (Cold Start Handling)

Since the backend is hosted in a demo environment, the first request may be slow.

To improve UX:

A warm-up request is sent on app initialization

Users are informed during the initial load

Subsequent navigation is fast and seamless

⚙️ Tech Stack

Frontend:
React, TypeScript, Vite, React Router, TailwindCSS, TanStack Table, Recharts, React-Toastify

Backend (Mock):
json-server (in-memory)

🚀 Local Setup
git clone https://github.com/Alimaliyev23/realmehkem-admin.git
cd realmehkem-admin
npm install
npm run dev
