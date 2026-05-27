import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { login } from '../api/client';
import { colors } from '../theme/colors';

export default function LoginScreen({ onLoginSuccess, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email.trim().toLowerCase(), password);
      onLoginSuccess?.(result.data);
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🌾 FarmersHub</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to explore fresh products and trusted farmers.</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <AppButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={loading}
        />

        <AppButton
          title="Create customer account"
          onPress={onShowRegister}
          variant="secondary"
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    fontSize: 16,
  },
});
