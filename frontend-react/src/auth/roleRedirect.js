export function roleHomePath(role) {
  if (role === 'customer') return '/customer';
  if (role === 'farmer') return '/farmer';
  if (role === 'provider') return '/provider';
  if (role === 'admin') return '/login';
  return '/login';
}
