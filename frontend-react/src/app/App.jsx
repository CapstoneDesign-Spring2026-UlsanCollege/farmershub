import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider.jsx';
import { AppRoutes } from './router.jsx';

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
