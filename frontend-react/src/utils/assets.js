export function publicAsset(path = '') {
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}

export function homeImage(fileName = '') {
  return publicAsset(`assets/images/home/${fileName}`);
}
