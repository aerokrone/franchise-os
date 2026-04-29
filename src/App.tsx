import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookingDataProvider } from './context/BookingDataContext'
import { InventoryRequestProvider } from './context/InventoryRequestContext'
import { SessionProvider } from './context/SessionContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AIBIPage } from './pages/AIBIPage'
import { POSPage } from './pages/POSPage'
import { InventoryPage } from './pages/InventoryPage'
import { InventoryDetailPage } from './pages/InventoryDetailPage'
import { CustomersPage } from './pages/CustomersPage'
import { CustomerPortalPage } from './pages/CustomerPortalPage'
import { CustomerChatPage } from './pages/CustomerChatPage'
import { ProductPurchasePage } from './pages/ProductPurchasePage'
import { CustomerOrderDetailPage } from './pages/CustomerOrderDetailPage'
import { CustomerOrdersPage } from './pages/CustomerOrdersPage'
import MyProfilePage from './pages/MyProfilePage'
import { OutletOrdersPage } from './pages/OutletOrdersPage'
import { CustomerBookingPage } from './pages/CustomerBookingPage'
import { CustomerMyBookingsPage } from './pages/CustomerMyBookingsPage'
import { HqServicesPage } from './pages/HqServicesPage'
import { ManagerBookingsPage } from './pages/ManagerBookingsPage'

export default function App() {
  return (
    <SessionProvider>
      <BookingDataProvider>
        <InventoryRequestProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/ai-bi" element={<AIBIPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/:sku" element={<InventoryDetailPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:customerId" element={<CustomersPage />} />
              <Route path="/customer-portal" element={<CustomerPortalPage />} />
              <Route path="/shop" element={<ProductPurchasePage />} />
              <Route path="/my-orders" element={<CustomerOrdersPage />} />
              <Route path="/my-orders/:orderId" element={<CustomerOrderDetailPage />} />
              <Route path="/store-orders" element={<OutletOrdersPage />} />
              <Route path="/ai-customer-chat" element={<CustomerChatPage />} />
              <Route path="/my-profile/*" element={<MyProfilePage />} />
              <Route path="/book" element={<CustomerBookingPage />} />
              <Route path="/my-bookings" element={<CustomerMyBookingsPage />} />
              <Route path="/services" element={<HqServicesPage />} />
              <Route path="/bookings" element={<ManagerBookingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </InventoryRequestProvider>
      </BookingDataProvider>
    </SessionProvider>
  )
}
