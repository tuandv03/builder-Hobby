import { useEffect, useState } from "react";
import { YugiohCard, ApiResponse } from "@shared/types";
import Layout from "@/components/Layout";
import CardItem from "@/components/CardItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Star,
  TrendingUp,
  Users,
  Package,
  ArrowUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlueEyesCards();
  }, []);

  const fetchBlueEyesCards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cards?archetype=Elemental HERO");

      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }

      const data: ApiResponse = await response.json();
      setCards(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const featuredCards = cards.slice(0, 12);
  const heroCard =
    cards.find((card) => card.id == 89943723) ||
    cards[0];

  // Back to top handler
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="space-y-2">
                <Badge className="bg-accent text-accent-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Premium Collection
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Master the <span className="text-primary">HERO</span>{" "}
                  Legacy
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-md">
                Discover the most powerful and iconic HERO archetype cards.
                From legendary dragons to support spells, build your ultimate
                deck.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="group">
                  <Link to="/cards">
                    Explore Collection
                    <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/archetypes">View All Archetypes</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {cards.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    HERO Cards
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">
                    Happy Duelists
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="relative animate-fade-in">
              {heroCard && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3 scale-105"></div>
                  <div className="relative bg-background rounded-2xl p-6 card-shine">
                    <img
                      src={`/images/${heroCard.name}_${heroCard.id}.jpg`}
                      alt={heroCard.name}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
                    />
                    <div className="mt-4 text-center">
                      <h3 className="text-xl font-semibold">{heroCard.name}</h3>
                      <p className="text-muted-foreground">{heroCard.type}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Featured HERO Cards
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the most powerful and sought-after cards from the
              HERO archetype. Each card is carefully selected for its
              strategic value and collector appeal.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  Loading HERO cards...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={fetchBlueEyesCards} variant="outline">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {featuredCards.map((card, index) => (
                <div
                  key={card.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardItem card={card} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && cards.length > 8 && (
            <div className="text-center">
              <Button asChild size="lg" variant="outline">
                <Link to="/cards">
                  View All {cards.length} HERO Cards
                  <Package className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DuelMaster?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best Yu-Gi-Oh! card shopping
              experience with authenticity, quality, and service you can trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Authentic Cards</h3>
                <p className="text-sm text-muted-foreground">
                  All cards are verified authentic and in pristine condition. We
                  guarantee the quality of every purchase.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Market Prices</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time pricing based on current market values. Get the best
                  deals on your favorite cards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our team of Yu-Gi-Oh! experts is here to help you build the
                  perfect deck and answer any questions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="icon"
          className="bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition"
          onClick={handleBackToTop}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      </div>
    </Layout>
  );
}
