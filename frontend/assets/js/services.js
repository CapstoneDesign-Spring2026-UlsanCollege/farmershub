const CATEGORY_LABELS = {
  tractor: 'Tractor',
  tiller: 'Tiller',
  irrigation_pump: 'Irrigation Pump',
  delivery_truck: 'Delivery Truck',
  fertilizer: 'Fertilizer',
  cold_storage: 'Cold Storage',
};

function labelForCategory(category) {
  return CATEGORY_LABELS[category] || 'All equipment providers';
}

function initialiseServicesPage() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || '';
  const action = params.get('action') || '';
  const label = labelForCategory(category);

  document.getElementById('servicesTitle').textContent = label;
  document.getElementById('servicesTopLabel').textContent = category ? `${label} services` : 'Equipment provider workspace';
  document.getElementById('requestCategory').value = label;

  if (category) {
    document.getElementById('servicesIntro').textContent = `${label} is selected. Real provider listings will appear after provider data and request storage are implemented.`;
    document.getElementById('servicesStateTitle').textContent = `${label} providers are not connected yet`;
  }

  document.querySelectorAll('.services-category-nav a').forEach((link) => {
    const href = new URL(link.href);
    if ((category && href.searchParams.get('category') === category) || (!category && !action && href.pathname.endsWith('/services.html') && !href.search)) {
      link.classList.add('active');
    }
    if (action === 'request' && href.searchParams.get('action') === 'request') {
      link.classList.add('active');
    }
  });

  if (action === 'request') {
    const requestArea = document.getElementById('requestArea');
    requestArea.classList.add('request-highlight');
    requestArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('servicesStateTitle').textContent = 'Request submission is not connected yet';
    document.getElementById('servicesStateText').textContent = 'Post a Request opens this request context, but it does not save anything until an EquipmentRequest backend is implemented and tested.';
  }
}

document.addEventListener('DOMContentLoaded', initialiseServicesPage);
