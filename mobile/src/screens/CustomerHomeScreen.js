import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import { API_BASE_URL } from '../api/client';
import { colors } from '../theme/colors';

export default function CustomerHomeScreen({ session, onOpenProducts, onOpenFarmers, onLogout }) {
  const user = session?.user || {};
  const name = user.fullName || user.name || 'Customer';
  const firstName = String(name).split(' ')[0] || 'Customer';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good harvest day 👋</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🌾</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>FarmersHub Mobile</Text>
            <Text style={styles.heroTitle}>Fresh food, trusted farmers, one tap away.</Text>
            <Text style={styles.heroSubtitle}>
              Browse local produce, discover verified providers, and prepare your mobile demo with a cleaner customer flow.
            </Text>
          </View>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeIcon}>🥬</Text>
            <Text style={styles.heroBadgeText}>Fresh today</Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.searchIcon}>🔎</Text>
          <Text style={styles.searchText}>Search products, farmers, crops...</Text>
        </View>

        <View style={styles.quickRow}>
          <ActionTile icon="🛒" title="Products" subtitle="Fresh market" onPress={onOpenProducts} />
          <ActionTile icon="👨‍🌾" title="Farmers" subtitle="Providers" onPress={onOpenFarmers} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s shortcuts</Text>
          <Text style={styles.sectionHint}>MVP ready</Text>
        </View>

        <View style={styles.cardGrid}>
          <InfoCard icon="🚚" title="Fast ordering" text="Product browsing is connected to the live backend." />
          <InfoCard icon="📍" title="Local farmers" text="Open farmer profiles with crops, products, and contact actions." />
        </View>

        <View style={styles.backendCard}>
          <View style={styles.backendHeader}>
            <Text style={styles.backendTitle}>Connected backend</Text>
            <Text style={styles.livePill}>Live</Text>
          </View>
          <Text style={styles.apiText}>{API_BASE_URL}</Text>
        </View>

        <AppButton title="Logout" onPress={onLogout} variant="danger" icon="🚪" />
      </ScrollView>

      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Market</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Messages</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>Alerts</Text>
        </View>
      </View>
    </View>
  );
}

function ActionTile({ icon, title, subtitle, onPress }) {
  return (
    <View style={styles.actionTile}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
      <AppButton title="Open" onPress={onPress} compact icon="↗" />
    </View>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 58,
    paddingBottom: 104,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greeting: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    color: colors.textStrong,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 25,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 30,
    padding: 22,
    minHeight: 214,
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  heroText: {
    maxWidth: '92%',
  },
  eyebrow: {
    color: colors.honey,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#dfeedd',
    marginTop: 12,
    lineHeight: 21,
    fontSize: 14,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 234, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  heroBadgeIcon: {
    fontSize: 15,
    marginRight: 7,
  },
  heroBadgeText: {
    color: colors.cream,
    fontWeight: '800',
  },
  searchCard: {
    marginTop: -18,
    marginHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchText: {
    color: colors.muted,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    minHeight: 178,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 12,
  },
  actionTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900',
  },
  actionSubtitle: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 12,
  },
  cardGrid: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: colors.cardMuted,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoTitle: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900',
  },
  infoText: {
    color: colors.mutedDark,
    marginTop: 6,
    lineHeight: 20,
  },
  backendCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  backendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  backendTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  livePill: {
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '900',
    fontSize: 12,
  },
  apiText: {
    color: colors.muted,
    fontWeight: '700',
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navItemActive: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.primaryPale,
    borderRadius: 18,
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 17,
    marginBottom: 2,
  },
  navText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  navTextActive: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
});
