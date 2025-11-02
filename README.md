# منصة جدوى للاستشارات - Jadwa Consulting Platform

A comprehensive consulting platform connecting clients with consultants, featuring video consultations, chat consultations, feasibility studies, and a powerful admin dashboard.

## Features

### Client Interface
- **Dashboard**: Overview of active consultations, ongoing studies, and spending
- **Video Consultations**: Browse and book consultants for video sessions
- **Chat Consultations**: Text-based consultations with file sharing
- **Study Requests**: Request feasibility studies, economic analysis, and financial reports
- **Document Management**: Access all uploaded and delivered files
- **Support System**: Create and track support tickets
- **Profile Management**: Update personal information

### Consultant Interface
- **Dashboard**: Overview of sessions, studies, earnings, and ratings
- **Session Management**: View and manage booked video sessions
- **Chat Management**: Respond to client chat requests
- **Study Assignments**: Work on assigned feasibility studies
- **Earnings Tracking**: View earnings and request payouts
- **Ratings & Reviews**: View client feedback

### Admin Dashboard
- **User Management**: Manage clients, consultants, and their accounts
- **Consultation Oversight**: Monitor all consultations and sessions
- **Financial Management**: Track payments, approve payouts, generate reports
- **Support Center**: Manage support tickets from users
- **Analytics**: View platform statistics and generate reports
- **Activity Logs**: Audit trail of admin actions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Icons**: Lucide React
- **State Management**: React Context API

## Database Schema

The platform uses 11 main tables:
- `users` - User accounts and profiles
- `consultants` - Consultant-specific information
- `consultations` - Video and chat consultation sessions
- `messages` - Chat messages
- `study_requests` - Feasibility studies and reports
- `payments` - Payment transactions
- `payouts` - Consultant withdrawal requests
- `support_tickets` - Customer support tickets
- `notifications` - In-app notifications
- `ratings` - Consultant ratings and reviews
- `admin_logs` - Admin activity logs

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (Client, Consultant, Admin)
- Secure authentication with JWT tokens
- Data isolation between users
- Comprehensive audit logging

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the project root:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Database Setup

The database migrations have already been applied. The schema includes:
- All required tables with proper relationships
- Row Level Security policies for each role
- Indexes for optimized queries

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### 5. Build for Production

\`\`\`bash
npm run build
\`\`\`

## User Roles

### Client
- Can register and login immediately
- Browse and book consultations
- Request feasibility studies
- Track orders and payments
- Create support tickets

### Consultant
- Registration requires admin approval
- Account status starts as "pending"
- Must complete profile with credentials
- Can accept consultation requests
- Can work on assigned studies
- Request payouts for earnings

### Admin
- Full platform access
- Manage all users and content
- Approve consultant registrations
- Process payouts
- Respond to support tickets
- View analytics and reports

## Default Test Users

You'll need to create users through the registration page:
1. Go to `/register` to create a new account
2. Choose "Client" or "Consultant" role
3. For admin access, manually update user role in database to 'admin'

## Project Structure

\`\`\`
src/
├── components/        # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── contexts/          # React Context providers
│   └── AuthContext.tsx
├── lib/               # Utilities and configurations
│   └── supabase.ts
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── client/        # Client interface pages
│   ├── consultant/    # Consultant interface pages
│   └── admin/         # Admin interface pages
├── App.tsx            # Main app component
└── main.tsx           # Entry point
\`\`\`

## Key Features Implementation Status

✅ **Completed**:
- Database schema with RLS policies
- User authentication (login/register)
- Role-based dashboards (Client, Consultant, Admin)
- Client modules: Video consultations, Studies, Support, Profile
- Consultant dashboard structure
- Admin dashboard with statistics
- Responsive design
- Arabic RTL support

🚧 **Pending** (Future Enhancements):
- Real-time chat with WebSocket
- Payment gateway integration (Stripe/Paymob)
- Video meeting integration (Zoom/WebRTC)
- File upload to cloud storage
- Email notifications
- Advanced analytics and reporting
- Calendar integration for scheduling
- Multi-language support

## Design Philosophy

The platform follows modern design principles:
- Clean, minimal interface
- Blue and gray color palette (avoiding purple/violet)
- Responsive design for all screen sizes
- Clear visual hierarchy
- Smooth transitions and interactions
- RTL support for Arabic content
- Accessible and user-friendly

## API Integration Notes

For future implementation:

**Payment Gateway**: Configure Stripe or Paymob API keys in environment variables
**Video Conferencing**: Integrate Zoom API or implement WebRTC for video calls
**Cloud Storage**: Set up AWS S3 or Supabase Storage for file uploads
**Email Service**: Configure SMTP or use Supabase Auth email templates

## Support

For issues or questions:
1. Check the support ticket system in the platform
2. Review the database logs in the admin panel
3. Check browser console for frontend errors
4. Review Supabase logs for backend issues

## License

This project is proprietary and confidential.

---

**Built with ❤️ for Jadwa Consulting Platform**
