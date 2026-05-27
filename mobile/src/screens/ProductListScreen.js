import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { getProducts } from '../api/client';
import { colors } from '../theme/colors';

export default function ProductListScreen({ onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadProducts(isRefresh = false) {
    try {
      setError('');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getProducts();
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function renderProduct({ item }) {
    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🌾</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.name || 'Unnamed product'}</Text>
          <Text style={styles.meta}>{item.category || 'Fresh produce'}</Text>
          <Text style={styles.price}>Rs {item.price ?? item.sellingPrice ?? 0}</Text>
          <Text style={styles.seller}>By {item.seller?.name || 'Farmer'}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>Fresh items from FarmersHub backend</Text>
        </View>
        <AppButton title="Back" onPress={onBack} variant="secondary" />
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Try again" onPress={() => loadProducts()} />
        </View>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No products found yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 56,
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
  header: {
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  placeholder: {
    width: 86,
    height: 86,
    borderRadius: 14,
    backgroundColor: '#e9f3e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  price: {
    color: colors.primaryDark,
    fontWeight: '900',
    marginTop: 8,
    fontSize: 16,
  },
  seller: {
    color: colors.muted,
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: '#fff3f3',
    borderColor: '#ffd1d1',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
  },
});
