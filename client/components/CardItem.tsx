import { YugiohCard } from "@shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Sword, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CardItemProps {
  card: YugiohCard;
  className?: string;
}

export default function CardItem({ card, className }: CardItemProps) {
  const formatPrice = (price?: string) => {
    if (!price || price === "0") return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getCardTypeColor = (type: string) => {
    if (type.includes("Monster")) return "bg-orange-500/10 text-orange-700 border-orange-200";
    if (type.includes("Spell")) return "bg-green-500/10 text-green-700 border-green-200";
    if (type.includes("Trap")) return "bg-purple-500/10 text-purple-700 border-purple-200";
    return "bg-gray-500/10 text-gray-700 border-gray-200";
  };

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return "bg-gray-500/10 text-gray-700";
    if (rarity.includes("Secret")) return "bg-yellow-500/10 text-yellow-700";
    if (rarity.includes("Ultra")) return "bg-blue-500/10 text-blue-700";
    if (rarity.includes("Super")) return "bg-purple-500/10 text-purple-700";
    return "bg-gray-500/10 text-gray-700";
  };

  const mainPrice = card.card_prices?.[0]?.tcgplayer_price || 
                   card.card_prices?.[0]?.cardmarket_price || 
                   card.card_sets?.[0]?.set_price;

  return (
    <Card className={cn("group card-hover card-shine overflow-hidden h-full", className)}>
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={card.card_images[0]?.image_url || "/placeholder.svg"}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Floating badges */}
          <div className="absolute top-2 left-2 space-y-1">
            <Badge className={cn("text-xs font-medium", getCardTypeColor(card.type))}>
              {card.type}
            </Badge>
            {card.archetype && (
              <Badge variant="outline" className="text-xs bg-background/90">
                {card.archetype}
              </Badge>
            )}
          </div>

          {/* Price tag */}
          {mainPrice && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-accent text-accent-foreground font-semibold">
                {formatPrice(mainPrice)}
              </Badge>
            </div>
          )}

          {/* Quick action overlay */}
          <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex gap-2">
              <Button asChild size="sm" className="flex-1 bg-background/90 hover:bg-background text-foreground">
                <Link to={`/card/${card.id}`}>
                  View Details
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="bg-background/90 hover:bg-background">
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {card.name}
          </h3>
          
          {/* Stats for monsters */}
          {card.atk !== undefined && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3" />
                <span>{card.atk}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>{card.def}</span>
              </div>
              {card.level && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>Lv.{card.level}</span>
                </div>
              )}
            </div>
          )}

          {/* Race/Attribute */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>{card.race}</span>
            {card.attribute && <span>{card.attribute}</span>}
          </div>

          {/* Description preview */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {card.desc}
          </p>

          {/* Sets */}
          {card.card_sets && card.card_sets.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Available Sets:</p>
              <div className="flex flex-wrap gap-1">
                {card.card_sets.slice(0, 2).map((set, index) => (
                  <Badge key={index} variant="outline" className={cn("text-xs", getRarityColor(set.set_rarity))}>
                    {set.set_rarity}
                  </Badge>
                ))}
                {card.card_sets.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{card.card_sets.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Price trend indicator */}
          {mainPrice && parseFloat(mainPrice) > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>Market Price</span>
              </div>
              <span className="font-semibold text-sm">{formatPrice(mainPrice)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
