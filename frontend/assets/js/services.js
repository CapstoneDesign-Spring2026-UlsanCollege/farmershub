function redirectToMarketplace() {
  const current = new URL(window.location.href);
  const target = new URL('farmer-services-marketplace.html', current);
  const category = current.searchParams.get('category');
  const search = current.searchParams.get('search');

  if (category) target.searchParams.set('category', category);
  if (search) target.searchParams.set('search', search);

  window.location.replace(target.toString());
}

document.addEventListener('DOMContentLoaded', redirectToMarketplace);
