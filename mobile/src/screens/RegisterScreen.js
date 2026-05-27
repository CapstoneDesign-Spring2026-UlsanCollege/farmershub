import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { registerUser } from '../api/client';
import { colors } from '../theme/colors';

export default function RegisterScreen({ onRegisterSuccess, onShowLogin }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleRegister() {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing details', 'Name, email, and password are required.');
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({
        ...form,
        email: form.email.trim().toLowerCase(),
        role: 'customer',
      });
      onRegisterSuccess?.(result.data);
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.logo}>🌱 FarmersHub</Text>
          <Text style={styles.title}>Create customer account</Text>
          <Text style={styles.subtitle}>Start discovering farmers and fresh products near you.</Text>

          <TextInput
            value={form.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            placeholder="Full name"
            style={styles.input}
          />

          <TextInput
            value={form.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <TextInput
            value={form.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="Phone number"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            value={form.address}
            onChangeText={(text) => updateField('address', text)}
            placeholder="Address / city"
            style={styles.input}
          />

          <AppButton
            title={loading ? 'Creating account...' : 'Register'}
            onPress={handleRegister}
            disabled={loading}
          />

          <AppButton
            title="Back to login"
            onPress={onShowLogin}
            variant="secondary"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
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
