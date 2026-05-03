# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Features

- User authentication (Signup/Login) with JWT
- Role-based access: Admin and Member
- Project management (CRUD operations)
- Task management with status tracking
- Dashboard with task statistics
- Responsive UI

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Deployment:** Railway

## Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud like MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MongoDB database:
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - Create a database named `teamtaskmanager` (Atlas will create it automatically)

4. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/teamtaskmanager
   JWT_SECRET=your_jwt_secret
   ```

   For MongoDB Atlas, use your connection string:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
   ```

   > Do not commit `.env` to source control. Keep your credentials secure.

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000` and connect to MongoDB.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get all projects (filtered by role)
- `POST /api/projects` - Create a new project (Admin only)
- `PUT /api/projects/:id` - Update a project (Admin only)
- `DELETE /api/projects/:id` - Delete a project (Admin only)

### Tasks
- `GET /api/tasks/project/:projectId` - Get tasks for a project
- `POST /api/tasks` - Create a new task (Admin only)
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task (Admin only)
- `GET /api/tasks/dashboard/stats` - Get dashboard statistics

## Deployment on Railway

### Backend Deployment

1. Create a new Railway project.
2. Connect your GitHub repository.
3. Set up a MongoDB database (Atlas or other hosted service).
   - If using Atlas, create a free cluster and a database user.
4. Set environment variables in Railway:
   - `MONGO_URI` = your MongoDB connection string
   - `JWT_SECRET` = a secure random string
   - `NODE_ENV` = production
5. Deploy the backend

### Frontend Deployment

1. Build the frontend for production:
   ```bash
   cd frontend
   npm run build
   ```

2. Create another Railway project for the frontend.
3. Upload the `build` folder or configure to serve static files.
4. Alternatively, modify the backend to serve the frontend static files.

### Full-Stack Deployment

For a simpler deployment, you can modify the backend to serve the frontend:

1. In `backend/server.js`, add:
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/build')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
     });
   }
   ```

2. Build the frontend and copy the `build` folder to the backend directory.
3. Deploy the entire project as one Railway service.

## Usage

1. Register as an Admin or Member user.
2. Login with your credentials.
3. Admins can create projects and assign members.
4. Create tasks within projects.
5. Members can update task statuses.
6. View dashboard statistics.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the MIT License.