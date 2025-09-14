import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
  onGetQuote: () => void;
}

const ProductCard = ({ title, description, image, onGetQuote }: ProductCardProps) => {
  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-300">
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={onGetQuote}
          className="w-full gradient-primary hover:opacity-90 transition-opacity"
        >
          <Quote className="w-4 h-4 mr-2" />
          Get Quotation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;