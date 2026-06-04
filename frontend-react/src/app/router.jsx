import { Navigate, Route, Routes } from 'react-router-dom';
import { roleHomePath } from '../auth/roleRedirect.js';
import { useAuth } from '../auth/useAuth.js';
import { RoleRoute } from '../auth/RoleRoute.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { CustomerLayout } from '../layouts/CustomerLayout.jsx';
import { FarmerLayout } from '../layouts/FarmerLayout.jsx';
import { ProviderLayout } from '../layouts/ProviderLayout.jsx';
import { LoginPage } from '../pages/public/LoginPage.jsx';
import { RegisterPage } from '../pages/public/RegisterPage.jsx';
import { NotFoundPage } from '../pages/public/NotFoundPage.jsx';
import {
  CustomerCartPage,
  CustomerFarmerProfilePage,
  CustomerFavoritesPage,
  CustomerHelpPage,
  CustomerHomePage,
  CustomerMarketplacePage,
  CustomerMessagesPage,
  CustomerNotificationsPage,
  CustomerOrdersPage,
  CustomerProductPage,
  CustomerProfilePage,
  CustomerSettingsPage,
  CustomerSocialFeedPage,
} from '../pages/customer/CustomerPages.jsx';
import {
  FarmerAnalyticsPage,
  FarmerCustomersPage,
  FarmerDashboardPage,
  FarmerHelpPage,
  FarmerInventoryPage,
  FarmerMessagesPage,
  FarmerOrdersPage,
  FarmerPaymentsPage,
  FarmerProductsPage,
  FarmerProfilePage,
  FarmerProviderMessagesPage,
  FarmerProviderProfilePage,
  FarmerServiceDetailPage,
  FarmerServiceNotificationsPage,
  FarmerServiceRequestPage,
  FarmerServiceRequestsPage,
  FarmerServicesPage,
  FarmerSettingsPage,
  FarmerSocialFeedPage,
} from '../pages/farmer/FarmerPages.jsx';
import {
  ProviderDashboardPage,
  ProviderHelpPage,
  ProviderListingFormPage,
  ProviderListingsPage,
  ProviderLoginPage,
  ProviderMessagesPage,
  ProviderNotificationsPage,
  ProviderOnboardingPage,
  ProviderProfilePage,
  ProviderRegisterPage,
  ProviderRequestDetailPage,
  ProviderRequestsPage,
  ProviderSettingsPage,
} from '../pages/provider/ProviderPages.jsx';

function HomeRedirect() {
  const { role } = useAuth();
  return <Navigate to={roleHomePath(role)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/provider/login" element={<ProviderLoginPage />} />
        <Route path="/provider/register" element={<ProviderRegisterPage />} />
      </Route>

      <Route
        path="/customer"
        element={(
          <RoleRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </RoleRoute>
        )}
      >
        <Route index element={<CustomerHomePage />} />
        <Route path="marketplace" element={<CustomerMarketplacePage />} />
        <Route path="products/:productId" element={<CustomerProductPage />} />
        <Route path="cart" element={<CustomerCartPage />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="messages" element={<CustomerMessagesPage />} />
        <Route path="favorites" element={<CustomerFavoritesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="farmers/:farmerId" element={<CustomerFarmerProfilePage />} />
        <Route path="settings" element={<CustomerSettingsPage />} />
        <Route path="notifications" element={<CustomerNotificationsPage />} />
        <Route path="help" element={<CustomerHelpPage />} />
        <Route path="feed" element={<CustomerSocialFeedPage />} />
      </Route>

      <Route
        path="/farmer"
        element={(
          <RoleRoute allowedRoles={['farmer']}>
            <FarmerLayout />
          </RoleRoute>
        )}
      >
        <Route index element={<FarmerDashboardPage />} />
        <Route path="products" element={<FarmerProductsPage />} />
        <Route path="orders" element={<FarmerOrdersPage />} />
        <Route path="inventory" element={<FarmerInventoryPage />} />
        <Route path="messages" element={<FarmerMessagesPage />} />
        <Route path="customers" element={<FarmerCustomersPage />} />
        <Route path="analytics" element={<FarmerAnalyticsPage />} />
        <Route path="payments" element={<FarmerPaymentsPage />} />
        <Route path="settings" element={<FarmerSettingsPage />} />
        <Route path="help" element={<FarmerHelpPage />} />
        <Route path="profile" element={<FarmerProfilePage />} />
        <Route path="services" element={<FarmerServicesPage />} />
        <Route path="services/:listingId" element={<FarmerServiceDetailPage />} />
        <Route path="service-request/:listingId" element={<FarmerServiceRequestPage />} />
        <Route path="service-requests" element={<FarmerServiceRequestsPage />} />
        <Route path="provider/:providerId" element={<FarmerProviderProfilePage />} />
        <Route path="provider-messages" element={<FarmerProviderMessagesPage />} />
        <Route path="service-notifications" element={<FarmerServiceNotificationsPage />} />
        <Route path="feed" element={<FarmerSocialFeedPage />} />
      </Route>

      <Route
        path="/provider"
        element={(
          <RoleRoute allowedRoles={['provider']}>
            <ProviderLayout />
          </RoleRoute>
        )}
      >
        <Route index element={<ProviderDashboardPage />} />
        <Route path="onboarding" element={<ProviderOnboardingPage />} />
        <Route path="listings" element={<ProviderListingsPage />} />
        <Route path="listings/new" element={<ProviderListingFormPage />} />
        <Route path="listings/:listingId/edit" element={<ProviderListingFormPage />} />
        <Route path="requests" element={<ProviderRequestsPage />} />
        <Route path="requests/:requestId" element={<ProviderRequestDetailPage />} />
        <Route path="messages" element={<ProviderMessagesPage />} />
        <Route path="notifications" element={<ProviderNotificationsPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
        <Route path="settings" element={<ProviderSettingsPage />} />
        <Route path="help" element={<ProviderHelpPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
