import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { getFarmerById } from '../api/client';
import { colors } from '../theme/colors';

export default function FarmerProfileScreen({ farmerId, onBack }) {
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFarmer() {
    try {
      setLoading(true);
      setError('');
      const result = await getFarmerById(farmerId);
      setFarmer(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarmer();
  }, [farmerId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading farmer profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Try again" onPress={loadFarmer} />
          <AppButton title="Back" onPress={onBack} variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppButton title="Back to farmers" onPress={onBack} variant="secondary" />

      {farmer?.coverUrl ? (
        <Image source={{ uri: farmer.coverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverIcon}>🌿</Text>
        </View>
      )}

      <View style={styles.profileCard}>
        {farmer?.avatarUrl ? (
          <Image source={{ uri: farmer.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👨‍🌾</Text>
          </View>
        )}

        <Text style={styles.name}>{farmer?.farmName || farmer?.fullName || 'Farmer'}</Text>
        <Text style={styles.meta}>{farmer?.fullName}</Text>
        <Text style={styles.location}>{farmer?.location || farmer?.address || 'Location not added'}</Text>

        {farmer?.bio ? <Text style={styles.bio}>{farmer.bio}</Text> : null}

        {farmer?.cropTypes?.length ? (
          <Text style={styles.crops}>Crops: {farmer.cropTypes.join(', ')}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products from this farmer</Text>

        {farmer?.products?.length ? (
          farmer.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={styles.productPlaceholder}>
                  <Text style={styles.productIcon}>🌾</Text>
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>Rs {product.price ?? 0}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No products added by this farmer yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
  },
  cover: {
    height: 150,
    borderRadius: 22,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  coverPlaceholder: {
    height: 150,
    borderRadius: 22,
    backgroundColor: '#e9f3e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  coverIcon: {
    fontSize: 44,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#e9f3e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 36,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
  location: {
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  bio: {
    color: colors.text,
    marginTop: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  crops: {
    color: colors.muted,
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  productPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#e9f3e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIcon: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  productCategory: {
    color: colors.muted,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  productPrice: {
    color: colors.primaryDark,
    fontWeight: '900',
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#fff3f3',
    borderColor: '#ffd1d1',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    margin: 16,
    marginTop: 64,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 8,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 18,
  },
});
