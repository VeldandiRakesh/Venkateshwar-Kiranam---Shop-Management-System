import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './App.jsx'
import { ProductProvider } from './contexts/ProductContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Toast from './components/Toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ProductProvider>
        <RouterProvider router={router} />
        <Toast />
      </ProductProvider>
    </ThemeProvider>
  </StrictMode>
)
