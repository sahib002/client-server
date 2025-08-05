import React from 'react';
import { useRoutes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Home from './components/home';
import Header from './components/header';
import './index.css';

const AppRoutes = () => {
  const { userLoggedIn } = useAuth();

  const routesArray = [
    {
      path: "/login",
      element: userLoggedIn ? <Dashboard /> : <Login />,
    },
    {
      path: "/register",
      element: userLoggedIn ? <Dashboard /> : <Register />,
    },
    {
      path: "/home",
      element: userLoggedIn ? <Home /> : <Login />,
    },
    {
      path: "/dashboard",
      element: userLoggedIn ? <Dashboard /> : <Login />,
    },
    {
      path: "/",
      element: userLoggedIn ? <Dashboard /> : <Login />,
    },
    {
      path: "*",
      element: userLoggedIn ? <Dashboard /> : <Login />,
    },
  ];
  
  let routesElement = useRoutes(routesArray);
  
  if (userLoggedIn) {
    return (
      <Layout>
        {routesElement}
      </Layout>
    );
  }
  
  return (
    <div>
      <Header />
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;