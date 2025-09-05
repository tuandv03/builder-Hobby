import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, Search } from "lucide-react";
import { YugiohCard, ApiResponse } from "@shared/types";

export default function Inventory() {
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rarity, setRarity] = useState<string>("all");

  // inventory from server: id -> quantity
  const [inventory, setInventory] = useState<Record<number, number>>({});
  // pending updates: id -> quantity
  const [updates, setUpdates] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsRes, invRes] = await Promise.all([
        fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Blue-Eyes"),
        fetch("/api/inventory"),
      ]);

      if (!cardsRes.ok) throw new Error("Failed to fetch cards");
      if (!invRes.ok) throw new Error("Failed to fetch inventory");

      const cardsData: ApiResponse = await cardsRes.json();
      const invData: { inventory: Record<number, number> } = await invRes.json();

      setCards(cardsData.data || []);
      setInventory(invData.inventory || {});
      setUpdates({});
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const rarityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) {
      for (const s of c.card_sets || []) {
        if (s.set_rarity) set.add(s.set_rarity);
      }
    }
    return ["all", ...Array.from(set).sort()];
  }, [cards]);

  const filteredCards = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    return cards.filter((c) => {
      const nameOk = term ? c.name.toLowerCase().includes(term) : true;
      const rarityOk = rarity === "all" ? true : (c.card_sets || []).some((s) => s.set_rarity === rarity);
      return nameOk && rarityOk;
    });
  }, [cards, appliedSearch, rarity]);

  const handleApplySearch = () => setAppliedSearch(searchTerm);

  const getCurrentQty = (id: number) => inventory[id] ?? 0;
  const getUpdatedQty = (id: number) => (updates[id] ?? getCurrentQty(id));

  const handleQtyChange = (id: number, value: string) => {
    const n = Math.max(0, Math.floor(Number(value))); // ensure >=0 int
    if (!Number.isFinite(n)) return;
    setUpdates((prev) => ({ ...prev, [id]: n }));
  };

  const changedCount = useMemo(() => {
    return Object.keys(updates).filter((k) => updates[Number(k)] !== getCurrentQty(Number(k))).length;
  }, [updates, inventory]);

  const handleSave = async () => {
    const payload: Record<number, number> = {};
    for (const [k, v] of Object.entries(updates)) {
      const id = Number(k);
      if (v !== getCurrentQty(id)) payload[id] = v;
    }
    if (Object.keys(payload).length === 0) return;

    try {
      setSaving(true);
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload }),
      });
      if (!res.ok) throw new Error("Failed to save inventory");
      const data: { inventory: Record<number, number> } = await res.json();
      setInventory(data.inventory || {});
      setUpdates({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save inventory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
            <p className="text-sm text-muted-foreground">Tìm kiếm theo tên card, cập nhật số lượng và lưu lại.</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên card..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
              />
            </div>
            <Button onClick={handleApplySearch} variant="outline">
              Tìm kiếm
            </Button>
            <Select value={rarity} onValueChange={setRarity}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "all" ? "Tất cả rarity" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={saving || changedCount === 0}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Lưu lại ({changedCount})
                </>
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Đang tải dữ liệu kho...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={loadData}>Thử lại</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mã</TableHead>
                  <TableHead>Tên card</TableHead>
                  <TableHead className="w-[220px]">Rarity</TableHead>
                  <TableHead className="w-[140px] text-right">Số lượng hiện tại</TableHead>
                  <TableHead className="w-[180px] text-right">Số lượng cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={c.card_images[0]?.image_url_small || "/placeholder.svg"}
                          alt={c.name}
                          className="w-10 h-14 object-cover rounded border"
                          loading="lazy"
                        />
                        <div>
                          <div className="font-medium leading-tight">{c.name}</div>
                          <div className="text-xs text-muted-foreground leading-tight">{c.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const rset = Array.from(
                            new Set((c.card_sets || []).map((s) => s.set_rarity).filter((r): r is string => Boolean(r)))
                          );
                          const shown = rset.slice(0, 3);
                          const extra = rset.length - shown.length;
                          return (
                            <>
                              {shown.map((r, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {r}
                                </Badge>
                              ))}
                              {extra > 0 && (
                                <Badge variant="outline" className="text-xs">+{extra}</Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{getCurrentQty(c.id)}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        className="w-28 ml-auto"
                        value={getUpdatedQty(c.id)}
                        onChange={(e) => handleQtyChange(c.id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
