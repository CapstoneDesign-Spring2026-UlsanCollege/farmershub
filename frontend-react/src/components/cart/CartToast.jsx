import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartToast({ productName, visible }) {
  if (!visible) return null;

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <CheckCircle2 size={20} />
      <div>
        <strong>Added to cart</strong>
        <span>{productName}</span>
      </div>
      <Link to="/customer/cart">View Cart</Link>
    </div>
  );
}
