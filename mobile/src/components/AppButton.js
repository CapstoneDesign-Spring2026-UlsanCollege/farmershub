import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  compact = false,
  fullWidth = true,
}) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        !fullWidth && styles.autoWidth,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text
          style={[
            styles.text,
            isSecondary && styles.secondaryText,
            isGhost && styles.ghostText,
            isDanger && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginVertical: 6,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  compact: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginVertical: 0,
  },
  autoWidth: {
    alignSelf: 'flex-start',
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0.07,
    elevation: 1,
  },
  ghost: {
    backgroundColor: colors.primaryPale,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: '#fff3f3',
    borderWidth: 1,
    borderColor: '#ffd1d1',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryText: {
    color: colors.primaryDark,
  },
  ghostText: {
    color: colors.primaryDark,
  },
  dangerText: {
    color: colors.danger,
  },
});
