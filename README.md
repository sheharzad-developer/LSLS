# LSLS - School Management System

A complete School Management System built with Next.js 16, TypeScript, Prisma, PostgreSQL, and NextAuth.

## Features

- **Role-based Authentication**: ADMIN, TEACHER, STUDENT, PARENT roles
- **Student Management**: CRUD operations for students
- **Teacher Management**: CRUD operations for teachers
- **Class Management**: Create and manage classes
- **Attendance Tracking**: Teachers can mark attendance, students and parents can view it
- **Results Management**: Track exam results (scaffolded)
- **Dashboard**: Role-specific dashboards with statistics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Credentials Provider)
- **Password Hashing**: bcryptjs
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lsls?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

4. **Set up the database**:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

5. **Create a seed admin user** (optional):
   You can create an admin user directly in the database or use Prisma Studio:
```bash
npm run db:studio
```

   Or create via SQL:
```sql
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-id',
  'Admin User',
  'admin@example.com',
  '$2a$10$hashedpassword', -- Use bcrypt to hash your password
  'ADMIN',
  NOW(),
  NOW()
);
```

6. **Run the development server**:
```bash
npm run dev
```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
LSLS/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes
│   │   │   └── login/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── teacher/       # Teacher pages
│   │   │   ├── student/       # Student pages
│   │   │   └── parent/        # Parent pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth routes
│   │   │   ├── students/      # Student CRUD
│   │   │   ├── teachers/      # Teacher CRUD
│   │   │   ├── classes/       # Class CRUD
│   │   │   └── attendance/    # Attendance CRUD
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth type definitions
│   └── middleware.ts          # Route protection middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Database Schema

The system includes the following main models:
- **User**: Base user model with authentication
- **Student**: Student-specific data
- **Teacher**: Teacher-specific data
- **Parent**: Parent-specific data
- **Class**: Class/grade information
- **Subject**: Subject information
- **Attendance**: Attendance records
- **Result**: Exam results

## API Routes

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create a student
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Teachers
- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create a teacher
- `GET /api/teachers/[id]` - Get teacher details
- `PUT /api/teachers/[id]` - Update teacher
- `DELETE /api/teachers/[id]` - Delete teacher

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create a class
- `GET /api/classes/[id]` - Get class details
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/[id]` - Update attendance
- `DELETE /api/attendance/[id]` - Delete attendance

## Role-Based Access

- **ADMIN**: Full access to all features
- **TEACHER**: Can view classes, mark attendance, manage results
- **STUDENT**: Can view own attendance, results, and profile
- **PARENT**: Can view children's attendance and results

## Development

- Run `npm run dev` for development
- Run `npm run build` for production build
- Run `npm run db:studio` to open Prisma Studio
- Run `npm run lint` to check for linting errors

## Notes

- Make sure to change `NEXTAUTH_SECRET` in production
- Use strong passwords for admin accounts
- The system uses bcrypt for password hashing
- All API routes are protected by role-based middleware

## License

MIT

# LSLS
