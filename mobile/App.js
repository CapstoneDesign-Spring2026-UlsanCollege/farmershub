import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CustomerHomeScreen from './src/screens/CustomerHomeScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import FarmerListScreen from './src/screens/FarmerListScreen';
import FarmerProfileScreen from './src/screens/FarmerProfileScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('login');
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);

  function handleAuthSuccess(data) {
    setSession(data);
    setScreen('home');
  }

  function handleLogout() {
    setSession(null);
    setSelectedFarmerId(null);
    setScreen('login');
  }

  function openFarmerProfile(farmerId) {
    setSelectedFarmerId(farmerId);
    setScreen('farmerProfile');
  }

  let content;

  if (!session && screen === 'register') {
    content = (
      <RegisterScreen
        onRegisterSuccess={handleAuthSuccess}
        onShowLogin={() => setScreen('login')}
      />
    );
  } else if (!session) {
    content = (
      <LoginScreen
        onLoginSuccess={handleAuthSuccess}
        onShowRegister={() => setScreen('register')}
      />
    );
  } else if (screen === 'products') {
    content = <ProductListScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'farmers') {
    content = (
      <FarmerListScreen
        onBack={() => setScreen('home')}
        onOpenFarmer={openFarmerProfile}
      />
    );
  } else if (screen === 'farmerProfile' && selectedFarmerId) {
    content = (
      <FarmerProfileScreen
        farmerId={selectedFarmerId}
        onBack={() => setScreen('farmers')}
      />
    );
  } else {
    content = (
      <CustomerHomeScreen
        session={session}
        onOpenProducts={() => setScreen('products')}
        onOpenFarmers={() => setScreen('farmers')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {content}
      <StatusBar style="dark" />
    </>
  );
}
