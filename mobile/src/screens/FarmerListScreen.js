import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import { getFarmers } from '../api/client';
import { colors } from '../theme/colors';

export default function FarmerListScreen({ onBack, onOpenFarmer }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadFarmers(isRefresh = false) {
    try {
      setError('');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getFarmers();
      setFarmers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFarmers();
  }, []);

  function renderFarmer({ item }) {
    return (
      <Pressable style={styles.card} onPress={() => onOpenFarmer?.(item.id)}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👨‍🌾</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.farmName || item.fullName || 'Farmer'}</Text>
          <Text style={styles.meta}>{item.fullName || item.email}</Text>
          <Text style={styles.location}>{item.location || item.address || 'Location not added'}</Text>
          {item.farmType ? <Text style={styles.farmType}>{item.farmType}</Text> : null}
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading farmers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Farmers</Text>
          <Text style={styles.subtitle}>Discover FarmersHub providers</Text>
        </View>
        <AppButton title="Back" onPress={onBack} variant="secondary" />
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Try again" onPress={() => loadFarmers()} />
        </View>
      ) : null}

      <FlatList
        data={farmers}
        keyExtractor={(item) => item.id}
        renderItem={renderFarmer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadFarmers(true)} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No farmers found yet.</Text>
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
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#e9f3e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
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
  },
  location: {
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 7,
  },
  farmType: {
    color: colors.muted,
    marginTop: 4,
    textTransform: 'capitalize',
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
