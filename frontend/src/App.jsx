import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import PriceCalculator from './pages/PriceCalculator';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'price-calculator',
        element: <PriceCalculator />
      },
      {
        path: 'billing',
        element: <Billing />
      },
      {
        path: 'sales-history',
        element: <SalesHistory />
      },
      {
        path: 'inventory',
        element: <Inventory />
      },
      {
        path: 'reports',
        element: <Reports />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);

export default router;