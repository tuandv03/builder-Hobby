import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, CheckCircle2 } from "lucide-react";
import {
  getCart,
  setQty,
  removeFromCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { Link } from "react-router-dom";

interface PriceInfo {
  id: number;
  name: string;
  image: string | null;
  prices?: { tcgplayer_price?: string };
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [prices, setPrices] = useState<Record<number, PriceInfo>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = getCart();
    setItems(c);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const map: Record<number, PriceInfo> = {};
        await Promise.all(
          items.map(async (it) => {
            const res = await fetch(
              `/api/price?id=${encodeURIComponent(String(it.id))}`,
            );
            if (res.ok) {
              const p = (await res.json()) as PriceInfo;
              map[it.id] = p;
            }
          }),
        );
        setPrices(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load prices");
      } finally {
        setLoading(false);
      }
    };
    if (items.length) load();
  }, [items]);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = prices[it.id]?.prices?.tcgplayer_price
        ? parseFloat(prices[it.id].prices!.tcgplayer_price!)
        : 0;
      return sum + price * it.qty;
    }, 0);
  }, [items, prices]);

  const handleQty = (id: number, qty: number) => {
    setQty(id, qty);
    setItems(getCart());
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
    setItems(getCart());
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      const payload = {
        items: items.map((it) => ({
          id: it.id,
          qty: it.qty,
          price: prices[it.id]?.prices?.tcgplayer_price
            ? parseFloat(prices[it.id]!.prices!.tcgplayer_price!)
            : 0,
        })),
      };
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit order");
      setDone(true);
      clearCart();
      setItems([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {error && <p className="text-destructive mb-4">{error}</p>}
        {done && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle2 className="w-5 h-5" /> Đã xác nhận đơn hàng
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground">Chưa có sản phẩm trong giỏ.</p>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="rounded border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ảnh</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead className="w-[100px]">Số lượng</TableHead>
                      <TableHead className="w-[120px]">Đơn giá ($)</TableHead>
                      <TableHead className="w-[120px]">
                        Thành tiền ($)
                      </TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => {
                      const info = prices[it.id];
                      const unit = info?.prices?.tcgplayer_price
                        ? parseFloat(info.prices.tcgplayer_price)
                        : 0;
                      const line = unit * it.qty;
                      return (
                        <TableRow key={it.id}>
                          <TableCell>
                            {info?.image ? (
                              <img
                                src={info.image}
                                alt={info?.name || String(it.id)}
                                className="h-16 w-auto rounded border object-cover"
                              />
                            ) : (
                              <div className="h-16 w-12 bg-muted rounded" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/card/${it.id}`}
                              className="text-primary hover:underline"
                            >
                              {info?.name || it.id}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) =>
                                handleQty(
                                  it.id,
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{unit.toFixed(2)}</TableCell>
                          <TableCell>{line.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(it.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-lg font-semibold">
                  Tổng: ${total.toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearCart();
                      setItems([]);
                    }}
                  >
                    Xóa giỏ
                  </Button>
                  <Button onClick={handleConfirm} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xác nhận
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
