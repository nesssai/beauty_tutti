import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ClientLayout } from '@/components/ClientLayout'
import { MasterShell } from '@/components/MasterShell'
import { RequireClient, RootRedirect } from '@/components/RouteGuards'
import { BookingProvider } from '@/context/BookingContext'
import { AccountPage } from '@/pages/AccountPage'
import { ClientHomePage } from '@/pages/ClientHomePage'
import { ClientLoginPage } from '@/pages/ClientLoginPage'
import { ClientRegisterPage } from '@/pages/ClientRegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import { MasterLoginPage } from '@/pages/MasterLoginPage'
import { MasterPage } from '@/pages/MasterPage'
import { BookConfirmPage } from '@/pages/book/BookConfirmPage'
import { BookDatetimePage } from '@/pages/book/BookDatetimePage'
import { BookDonePage } from '@/pages/book/BookDonePage'
import { BookLayout } from '@/pages/book/BookLayout'
import { BookMasterPage } from '@/pages/book/BookMasterPage'
import { BookSalonPage } from '@/pages/book/BookSalonPage'
import { BookServicePage } from '@/pages/book/BookServicePage'

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/login/client" element={<ClientLoginPage />} />
          <Route path="/login/master" element={<MasterLoginPage />} />
          <Route path="/login/master/:masterId" element={<MasterLoginPage />} />
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
