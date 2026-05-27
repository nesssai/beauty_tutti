import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ClientLayout } from '@/components/ClientLayout'
import { MasterShell } from '@/components/MasterShell'
import { RequireClient, RootRedirect } from '@/components/RouteGuards'
import { BookingProvider, useBookingApp } from '@/context/BookingContext'
import { AccountPage } from '@/pages/AccountPage'
import { ClientHomePage } from '@/pages/ClientHomePage'
import { ClientRegisterPage } from '@/pages/ClientRegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { MasterPage } from '@/pages/MasterPage'
import { BookConfirmPage } from '@/pages/book/BookConfirmPage'
import { BookDatetimePage } from '@/pages/book/BookDatetimePage'
import { BookDonePage } from '@/pages/book/BookDonePage'
import { BookLayout } from '@/pages/book/BookLayout'
import { BookMasterPage } from '@/pages/book/BookMasterPage'
import { BookSalonPage } from '@/pages/book/BookSalonPage'
import { BookServicePage } from '@/pages/book/BookServicePage'

function ApiBanner() {
  const { apiError, ready } = useBookingApp()
  if (!ready || !apiError) return null
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-base text-amber-900">
      {apiError}
    </div>
  )
}

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ApiBanner />
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/client" element={<Navigate to="/login" replace />} />
          <Route path="/login/master" element={<Navigate to="/login" replace />} />
          <Route path="/login/master/:masterId" element={<Navigate to="/login" replace />} />
          <Route path="/register/client" element={<ClientRegisterPage />} />
          <Route path="/" element={<RootRedirect />} />
          <Route element={<RequireClient />}>
            <Route element={<ClientLayout />}>
              <Route path="home" element={<ClientHomePage />} />
              <Route path="book" element={<BookLayout />}>
                <Route index element={<Navigate to="service" replace />} />
                <Route path="service" element={<BookServicePage />} />
                <Route path="salon" element={<BookSalonPage />} />
                <Route path="master" element={<BookMasterPage />} />
                <Route path="datetime" element={<BookDatetimePage />} />
                <Route path="confirm" element={<BookConfirmPage />} />
                <Route path="done" element={<BookDonePage />} />
              </Route>
              <Route path="account" element={<AccountPage />} />
            </Route>
          </Route>
          <Route path="/master" element={<MasterShell />}>
            <Route index element={<MasterPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  )
}
