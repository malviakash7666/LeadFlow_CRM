# LeadFlow CRM 🚀

LeadFlow CRM is an enterprise-grade Lead Management Platform designed to streamline the sales pipeline, manage leads, and boost team productivity. Built with a modern tech stack to ensure high performance, security, and a beautiful user interface.

## 🌟 Features

- **Lead Management**: Capture, assign, and track leads through different stages of your sales pipeline.
- **Agent Dashboard**: A centralized view for sales agents to monitor their daily activities and priority leads.
- **Activity Logging**: Keep track of every interaction and status change to maintain full context.
- **Role-Based Access**: Secure authentication with specific roles (e.g., Admin, Agent).
- **Notifications**: Real-time notifications for lead assignments and important updates.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite) with TypeScript
- **Styling**: Tailwind CSS for a sleek, responsive, and dark-themed UI.
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Environment**: Node.js & Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (Access & Refresh tokens) with secure HTTP-only cookies.
- **API Documentation**: Swagger UI

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL

### Installation

1. **Clone the repository** (if not already done).
2. **Install dependencies**:
   - For backend: `cd backend && npm install`
   - For frontend: `cd frontend && npm install`

### Database Setup
1. Create a PostgreSQL database for the project.
2. Update the `.env` file in the `backend` directory with your database credentials.
3. Run migrations to create the necessary tables:
   ```bash
   cd backend
   npm run db:migrate
   ```

### Running the Application

**Start the Backend Server (Development)**
```bash
cd backend
npm run dev
```

**Start the Frontend Server (Development)**
```bash
cd frontend
npm run dev
```
By default, the backend runs on port 5000 and the frontend on port 5173.

## 🔒 Environment Variables
Ensure you have the proper `.env` files set up in both the `frontend` and `backend` directories (e.g. configuring `VITE_API_URL` for the frontend and database/JWT secrets for the backend).

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
