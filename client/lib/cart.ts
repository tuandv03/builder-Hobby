export type CartItem = { id: number; qty: number };
const KEY = "cart_items";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(id: number, qty = 1) {
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) items[idx].qty += qty;
  else items.push({ id, qty });
  write(items);
}

export function removeFromCart(id: number) {
  write(read().filter((i) => i.id !== id));
}

export function setQty(id: number, qty: number) {
  if (qty <= 0) return removeFromCart(id);
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) items[idx].qty = qty;
  write(items);
}

export function clearCart() {
  write([]);
}
