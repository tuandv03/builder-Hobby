import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse, YugiohCard } from "@shared/types";
import { Link } from "react-router-dom";

type QueryOption = {
  key: string;
  label: string;
  params: Record<string, string>;
};

const OPTIONS: QueryOption[] = [
  { key: "all", label: "Get all cards", params: {} },
  {
    key: "darkMagician",
    label: 'Get "Dark Magician" card information',
    params: { name: "Dark Magician" },
  },
  {
    key: "blueEyes",
    label: 'Get all cards belonging to "Blue-Eyes" archetype',
    params: { archetype: "Blue-Eyes" },
  },
  {
    key: "l4WaterAtk",
    label: "Get all Level 4/RANK 4 Water cards and order by atk",
    params: { level: "4", attribute: "water", sort: "atk" },
  },
  {
    key: "banlistL4",
    label:
      "Get all cards on the TCG Banlist who are level 4 and order by name (A-Z)",
    params: { banlist: "tcg", level: "4", sort: "name" },
  },
  {
    key: "mrDark",
    label: "Get all card from set",
    params: { cardset: "" },
  },
  {
    key: "wizardLightSpellcaster",
    label:
      'Get all cards with "Wizard" in name, LIGHT attribute, race Spellcaster',
    params: { fname: "Wizard", attribute: "light", race: "spellcaster" },
  },
  {
    key: "equipSpell",
    label: "Get all Spell Cards that are Equip Spell Cards",
    params: { type: "spell card", race: "equip" },
  },
  {
    key: "speedDuel",
    label: "Get all Speed Duel Format Cards",
    params: { format: "Speed Duel" },
  },
  {
    key: "rushDuel",
    label: "Get all Rush Duel Format Cards",
    params: { format: "Rush Duel" },
  },
  {
    key: "waterLinkMarkers",
    label: "Get all Water Link Monsters with Link Markers of Top and Bottom",
    params: {
      attribute: "water",
      type: "Link Monster",
      linkmarker: "top,bottom",
    },
  },
  {
    key: "miscTornadoDragon",
    label: "Get Card Information with misc parameter (Tornado Dragon)",
    params: { name: "Tornado Dragon", misc: "yes" },
  },
  {
    key: "staples",
    label: "Get all cards considered Staples",
    params: { staple: "yes" },
  },
  {
    key: "tcgDateRange",
    label: "Get all TCG cards released between 2000-01-01 and 2002-08-23",
    params: {
      startdate: "2000-01-01",
      enddate: "2002-08-23",
      dateregion: "tcg",
    },
  },
];

function buildQueryString(base: Record<string, string>, extra: string): string {
  // Parse extraParams thành object
  const extraObj: Record<string, string> = {};
  const extraTrim = extra.trim();
  //console.log("extraTrim", extraTrim);
  if (extraTrim) {
    for (const pair of extraTrim.split("&")) {
      const [k, v = ""] = pair.split("=");
      const key = k?.trim();
      if (!key) continue;
      extraObj[key] = decodeURIComponent(v);
      //console.log("pair", pair, key, v,decodeURIComponent(v));
    }
  }
  // Chỉ lấy key từ base, value từ extraObj (nếu có)
  const params = new URLSearchParams();
  Object.keys(base).forEach((k) => {
    params.append(k, extraTrim);
  });
  // // Nếu extraObj có key không nằm trong base, cũng thêm vào
  // Object.entries(extraObj).forEach(([k, v]) => {
  //   if (!(k in base)) params.append(k, v);
  // });
//  params.append("", extraTrim);
  return params.toString();
}

export default function Admin() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string>(OPTIONS[0].key);
  const [extraParams, setExtraParams] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<YugiohCard[] | null>(null);

  const selectedOption = useMemo(
    () => OPTIONS.find((o) => o.key === selected)!,
    [selected],
  );

  const endpointPreview = useMemo(() => {
    const qs = buildQueryString(selectedOption.params, extraParams);
    const api = `/api/cards${qs ? `?${qs}` : ""}`;
    const remote = `https://db.ygoprodeck.com/api/v7/cardinfo.php${qs ? `?${qs}` : ""}`;
    return { api, remote };
  }, [selectedOption, extraParams]);

  const handleFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setCards(null);
      const valueParams = fetch("/api/cardsets");
      const res = await fetch(endpointPreview.api);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: ApiResponse = await res.json();
      setCards(data.data || []);
      toast({
        title: "Thành công",
        description: `Đã tải ${data.data?.length ?? 0} cards`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch";
      setError(msg);
      toast({ title: "Thất bại", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const sample = (cards ?? []).slice(0, 20);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin: Pull data từ API</h1>
          <p className="text-sm text-muted-foreground">
            Chọn mẫu truy vấn, nhập tham số bổ sung (key=value&key2=value2), và
            nhấn Lấy dữ liệu.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-2 block">
                  Chọn truy vấn
                </label>
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn truy vấn" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIONS.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Tham số bổ sung (tùy chọn)
                </label>
                <Input
                  placeholder="ví dụ: level=7&attribute=dark"
                  value={extraParams}
                  onChange={(e) => setExtraParams(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFetch} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lấy
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" /> Lấy dữ liệu
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtraParams("");
                    setCards(null);
                    setError(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Endpoint nội bộ:{" "}
              <code className="text-foreground">{endpointPreview.api}</code>
              <br />
              Endpoint gốc:{" "}
              <code className="text-foreground">{endpointPreview.remote}</code>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Kết quả</h2>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : cards ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tổng: {cards.length}. Hiển thị 20 mục đầu.
                  </p>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Tên</TableHead>
                          <TableHead>Loại</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sample.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.card_sets.find(s=>s.set_code.indexOf(extraParams) > 0)?.set_code}</TableCell>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Chưa có dữ liệu.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Xem JSON (mẫu)</h2>
              <ScrollArea className="h-80 rounded border p-3 bg-muted/20">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(sample, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
