# TaskFast - Task Management Application

A full-stack task management application built with React, Node.js, Express, MongoDB, and Firebase Authentication.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 📝 Task Management (Create, Read, Update, Delete)
- 🎯 Priority Levels (Low, Medium, High)
- 📊 Task Statistics Dashboard
- 📱 Responsive Design with Tailwind CSS
- 🔥 Real-time Authentication State

## Tech Stack

### Frontend

- React 19
- React Router DOM
- Firebase Authentication
- Tailwind CSS
- Axios for API calls
- Lucide React for icons

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Firebase project setup

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd client-server
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and set up Email/Password sign-in
4. Get your Firebase config and update `client/src/firebase/firebase.js`

### 3. MongoDB Setup

Choose one of the following options:

#### Option A: Local MongoDB

1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The app will automatically create the `taskfast` database

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get connection string and update `server/index.js`

### 4. Install Dependencies

#### Backend Setup

```bash
cd server
npm install
```

#### Frontend Setup

```bash
cd ../client
npm install
```

### 5. Environment Setup

The Firebase configuration is already set up in the code. Make sure your Firebase project has:

- Authentication enabled
- Email/Password provider enabled

### 6. Run the Application

#### Start the Backend Server

```bash
cd server
npm run dev
# or
npm start
```

The server will run on http://localhost:5000

#### Start the Frontend

```bash
cd client
npm start
```

The client will run on http://localhost:3000

## How to Use

### 1. Authentication

- Visit http://localhost:3000
- If not logged in, you'll be redirected to the login page
- Register a new account or login with existing credentials
- After successful authentication, you'll be redirected to the dashboard

### 2. Dashboard

- View task statistics (Total, Completed, High Priority, Pending)
- Filter tasks by status or priority
- See all your tasks in an organized layout

### 3. Navigation

- Use the navbar to navigate between pages
- Logout button to end your session

## API Endpoints

The backend provides the following REST API endpoints:

```
GET    /api/tasks     - Get all tasks
POST   /api/tasks     - Create a new task
GET    /api/tasks/:id - Get a specific task
PUT    /api/tasks/:id - Update a task
DELETE /api/tasks/:id - Delete a task
```

## Project Structure

```
client-server/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── Layout.jsx  # Main layout wrapper
│   │   │   └── Navbar.jsx  # Navigation component
│   │   ├── contexts/       # React contexts
│   │   │   └── authContext/# Firebase auth context
│   │   ├── firebase/       # Firebase configuration
│   │   ├── pages/          # Page components
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## Common Issues & Solutions

### 1. Firebase Errors

- **Issue**: "Firebase app not initialized"
- **Solution**: Check Firebase configuration in `client/src/firebase/firebase.js`

### 2. MongoDB Connection

- **Issue**: "MongooseError: buffering timed out"
- **Solution**: Ensure MongoDB is running or check connection string

### 3. CORS Errors

- **Issue**: Cross-origin requests blocked
- **Solution**: CORS is already configured in `server/index.js`

### 4. Port Conflicts

- **Issue**: Port already in use
- **Solution**:
  - Frontend: Set different port in package.json start script
  - Backend: Change PORT in `server/index.js`

## Development

### Adding New Features

1. **Frontend**: Add components in `client/src/components/`
2. **Backend**: Add routes in `server/routes/` and controllers in `server/controllers/`
3. **Database**: Add models in `server/models/`

### Code Style

- Use ES6+ features
- Follow React functional component patterns
- Use async/await for asynchronous operations
- Maintain consistent naming conventions

## Deployment

### Frontend (Netlify/Vercel)

1. Build the project: `npm run build`
2. Deploy the `build` folder

### Backend (Heroku/Railway)

1. Set environment variables
2. Update MongoDB connection string
3. Deploy the `server` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB and Firebase are properly configured
4. Check network connectivity

For additional help, please open an issue in the repository.
