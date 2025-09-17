import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { YugiohCard, ApiResponse } from "@shared/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Star,
  Sword,
  Shield,
  TrendingUp,
  Package,
  Info,
  ShoppingCart,
  Heart,
  Share2,
  Loader2,
} from "lucide-react";

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<YugiohCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type InvRow = { set_code?: string; card_name: string; rarity?: string; quantity: number };
  const [inv, setInv] = useState<InvRow[] | null>(null);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [showAllSets, setShowAllSets] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCard(id);
    }
  }, [id]);

  useEffect(() => {
    const loadInv = async (cardId: number) => {
      try {
        setInvLoading(true);
        setInvError(null);
        const res = await fetch(`/api/inventory?card_id=${encodeURIComponent(String(cardId))}`);
        if (!res.ok) throw new Error("Failed to load inventory");
        const data = await res.json();
        setInv(Array.isArray(data.data) ? data.data as InvRow[] : []);
      } catch (e) {
        setInvError(e instanceof Error ? e.message : "Failed to load inventory");
      } finally {
        setInvLoading(false);
      }
    };
    if (card?.id) loadInv(card.id);
  }, [card?.id]);

  const fetchCard = async (cardId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/card?id=${encodeURIComponent(cardId)}`,
      );

      if (!response.ok) {
        throw new Error("Card not found");
      }

      const data: ApiResponse = await response.json();
      setCard(data.data[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load card");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: string) => {
    if (!price || price === "0") return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getCardTypeColor = (type: string) => {
    if (type.includes("Monster"))
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    if (type.includes("Spell"))
      return "bg-green-500/10 text-green-700 border-green-200";
    if (type.includes("Trap"))
      return "bg-purple-500/10 text-purple-700 border-purple-200";
    return "bg-gray-500/10 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading card details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !card) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-destructive mb-4">
                  {error || "Card not found"}
                </p>
                <Button asChild variant="outline">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/cards" className="hover:text-primary transition-colors">
            Cards
          </Link>
          <span>/</span>
          <span className="text-foreground">{card.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Card Image */}
          <div className="space-y-4">
            <div className="relative aspect-[2/3] max-w-md mx-auto lg:mx-0">
              <img
                src={`${card.card_images[0].image_url}.jpg`
                 // `/images/${card.name}_${card.id}.jpg` || "/placeholder.svg"
                }
                alt={card.name}
                className="w-full h-full object-cover rounded-lg shadow-xl card-shine"
              />
            </div>

            {/* Additional Images */}
            {card.card_images.length > 1 && (
              <div className="flex gap-2 justify-center lg:justify-start">
                {card.card_images.slice(1,4).map((image, index) => (
                  <img
                    key={index}
                    src={`${image.image_url_small}.jpg`}
                    alt={`${card.name} variant ${index + 1}`}
                    className="w-16 h-24 object-cover rounded border hover:border-primary cursor-pointer transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Card Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getCardTypeColor(card.type)}>
                  {card.type}
                </Badge>
                {card.archetype && (
                  <Badge variant="outline">{card.archetype}</Badge>
                )}
                {card.frameType && (
                  <Badge variant="secondary">{card.frameType}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{card.name}</h1>

              {/* Stats for monsters */}
              {card.atk !== undefined && (
                <div className="flex items-center gap-6 text-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Sword className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">{card.atk}</span>
                    <span className="text-muted-foreground">ATK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">{card.def}</span>
                    <span className="text-muted-foreground">DEF</span>
                  </div>
                  {card.level && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">Level {card.level}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Race and Attribute */}
              <div className="flex gap-4 text-muted-foreground mb-6">
                <span>
                  <strong>Race:</strong> {card.race}
                </span>
                {card.attribute && (
                  <span>
                    <strong>Attribute:</strong> {card.attribute}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Card Effect</h3>
              <p className="text-muted-foreground leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="flex-1 min-w-fit" onClick={async () => {
                if (!card) return;
                const { addToCart } = await import("@/lib/cart");
                addToCart(card.id, 1);
                // Optional: navigate to cart
                // window.location.href = "/cart";
              }}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Card ID:</span>
                    <span className="ml-2 font-medium">{card.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{card.type}</span>
                  </div>
                  {card.archetype && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Archetype:</span>
                      <span className="ml-2 font-medium">{card.archetype}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="sets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sets">Card Sets</TabsTrigger>
            <TabsTrigger value="prices">Market Prices</TabsTrigger>
            <TabsTrigger value="info">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="sets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Available Sets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {card.card_sets && card.card_sets.length > 0 ? (
                  <div className="space-y-3">
                    {card.card_sets.map((set, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{set.set_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {set.card_code}
                          </p>
                        </div>                        
                        <div className="text-right">
                          <Badge variant="outline">{set.set_rarity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No set information available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

         
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Card Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Card ID:</dt>
                    <dd className="font-medium">{card.id}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="font-medium">{card.type}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Race:</dt>
                    <dd className="font-medium">{card.race}</dd>
                  </div>
                  {card.attribute && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Attribute:</dt>
                        <dd className="font-medium">{card.attribute}</dd>
                      </div>
                    </>
                  )}
                  {card.archetype && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Archetype:</dt>
                        <dd className="font-medium">{card.archetype}</dd>
                      </div>
                    </>
                  )}
                  {card.frameType && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Frame Type:</dt>
                        <dd className="font-medium">{card.frameType}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <div className="mt-8 pt-8 border-t">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collection
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
