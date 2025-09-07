import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Save, Search } from "lucide-react";
import { YugiohCard, ApiResponse } from "@shared/types";

// Model inventory
export interface InventoryItem {
  card_code: string;
  card_name: string;
  set_rarity: string;
  quantity: number;
  card_url?: string;
}

export default function Inventory() {
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rarity, setRarity] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // inventory from server: array of InventoryItem
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // pending updates: card_code + set_rarity -> quantity
  const [updates, setUpdates] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const invRes = await fetch("/api/inventory", { cache: "no-store" });
      if (!invRes.ok) throw new Error("Failed to fetch inventory");
      const invData = await invRes.json();
      // Giả sử trả về: { inventory: InventoryItem[] }
      setInventory(invData.data || []);
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

  // Mapping rows từ inventory
  const rows = useMemo(() => {
    return inventory.map((item) => ({
      key: `${item.card_code}::${item.set_rarity}`,
      card_code: item.card_code,
      card_name: item.card_name,
      set_rarity: item.set_rarity,
      quantity: item.quantity,
      card_url: item.card_url
    }));
  }, [inventory]);

  const filteredRows = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    return rows.filter((row) => {
      const nameOk = term ? row.card_name.toLowerCase().includes(term) : true;
      const rarityOk = rarity === "all" ? true : row.set_rarity === rarity;
      return nameOk && rarityOk;
    });
  }, [rows, appliedSearch, rarity]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.min(
    (page - 1) * pageSize,
    Math.max(0, (totalPages - 1) * pageSize),
  );
  const end = Math.min(total, start + pageSize);
  const pageRows = useMemo(
    () => filteredRows.slice(start, start + pageSize),
    [filteredRows, start, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, rarity]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagesToShow = useMemo(() => {
    const arr: number[] = [];
    const range = 2;
    const s = Math.max(1, page - range);
    const e = Math.min(totalPages, page + range);
    for (let p = s; p <= e; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);

  const handleApplySearch = () => setAppliedSearch(searchTerm);

  const getCurrentQtyByKey = (key: string) => {
    const item = inventory.find((i) => `${i.card_code}::${i.set_rarity}` === key);
    return item ? item.quantity : 0;
  };
  const getUpdatedQtyByKey = (key: string) =>
    updates[key] ?? getCurrentQtyByKey(key);

  const handleQtyChangeByKey = (key: string, value: string) => {
    const n = Math.max(0, Math.floor(Number(value)));
    if (!Number.isFinite(n)) return;
    setUpdates((prev) => ({ ...prev, [key]: n }));
  };

  const changedCount = useMemo(() => {
    return Object.keys(updates).filter(
      (k) => updates[k] !== getCurrentQtyByKey(k),
    ).length;
  }, [updates, inventory]);

  const handleSave = async () => {
    const payload: Record<string, number> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== getCurrentQtyByKey(k)) payload[k] = v;
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
      const data = await res.json();
      setInventory(data.inventory || []);
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
            <p className="text-sm text-muted-foreground">
              Tìm kiếm theo tên card, cập nhật số lượng và lưu lại.
            </p>
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
            <Button
              onClick={handleSave}
              disabled={saving || changedCount === 0}
            >
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
              <Button variant="outline" onClick={loadData}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] text-center">Hình ảnh</TableHead>
                  <TableHead className="w-[150px] text-center">Mã Card</TableHead>
                  <TableHead>Tên Card</TableHead>
                  <TableHead className="w-[220px] text-center">Rarity</TableHead>
                  <TableHead className="w-[140px] text-center">
                    Số lượng
                  </TableHead>
                  <TableHead className="w-[180px] text-center">
                    Số lượng cập nhật
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <img
                        src={`/images_small/${row.card_url}.jpg`}
                        alt={row.card_name}
                        className="w-16 h-16 object-cover rounded text-center mx-auto"
                        onError={e => (e.currentTarget.src = "/placeholder.svg")}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center">{row.card_code}</TableCell>
                    <TableCell>{row.card_name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {row.set_rarity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        className="w-28 ml-auto"
                        value={getUpdatedQtyByKey(row.key)}
                        onChange={(e) =>
                          handleQtyChangeByKey(row.key, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Hiển thị {total === 0 ? 0 : start + 1}–{end} / Tổng {total}
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Kích thước trang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(Math.max(1, page - 1));
                        }}
                      />
                    </PaginationItem>
                    {pagesToShow.map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(Math.min(totalPages, page + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
