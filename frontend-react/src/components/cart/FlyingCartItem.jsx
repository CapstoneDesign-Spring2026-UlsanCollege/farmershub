export function FlyingCartItem({ imageUrl, active }) {
  if (!active) return null;

  return (
    <span className="flying-cart-item" aria-hidden="true">
      {imageUrl ? <img src={imageUrl} alt="" /> : null}
    </span>
  );
}
