# Community Fitness Platform

A Next.js-based community fitness platform that connects users, trainers, organizers, and admins in a comprehensive fitness ecosystem.

## Features

- **User Roles**: Admin, Organizer, Trainer, and regular User accounts
- **Event Management**: Create and manage fitness events
- **Messaging System**: Communicate between users, trainers, and organizers
- **Trainer Invitations & Requests**: Manage trainer-client relationships
- **Workout Plans & Routines**: Track progress and routines
- **Community Feed**: Share posts and comments
- **Notifications**: Stay updated on activities
- **Analytics & Reports**: Admin and organizer dashboards

## Prerequisites

- Node.js (v18 or higher)
- npm
- PostgreSQL database (configured via Supabase)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd community-fitness-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://postgres.ozfltmyavyqqtjvynifv:Dinho.210380@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
   JWT_SECRET=change-this-to-a-long-random-secret
   SUPABASE_URL=https://ozfltmyavyqqtjvynifv.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Zmx0bXlhdnlxcXRqdnluaWZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQxOTc3OSwiZXhwIjoyMDg4OTk1Nzc5fQ.GYK3blFM9seWTYgsoIBXerfCUUTz-6DWYkS3DXE3EyQ
   ```

4. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations** (optional, will not be needed as migrations will already be cloned, just run generate command):
   ```bash
   npm run prisma:migrate
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://0.0.0.0:3000 (accessible from other devices on the same network)

## Testing Features

1. **Authentication**:
   - Register new accounts at `/auth/register`
   - Login at `/auth/login`
   - Test different user roles (admin, organizer, trainer, user)

2. **User Dashboard** (`/user/dashboard`):
   - View personal dashboard
   - Access community feed, events, messages, trainers

3. **Trainer Features** (`/trainer/dashboard`):
   - Manage clients, earnings, events
   - Handle trainer requests and invitations

4. **Organizer Features** (`/organizer/dashboard`):
   - Create and manage events
   - View participants, messages, community

5. **Admin Features** (`/admin/dashboard`):
   - Access analytics, reports, events, trainers

6. **API Testing**:
   - Use tools like Postman or curl to test API endpoints
   - Key endpoints: `/api/auth/*`, `/api/events/*`, `/api/messages/*`, `/api/users/*`

7. **Database**:
   - Check Prisma Studio: `npx prisma studio`
   - Verify data in your Supabase dashboard

## Building for Production

```bash
npm run build
npm run start
```

## Additional Commands

- **Linting**: `npm run lint`
- **Prisma Generate**: `npm run prisma:generate`
- **Prisma Migrate**: `npm run prisma:migrate`

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Storage**: Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.