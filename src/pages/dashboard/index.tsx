import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryFilterCard } from "@/components/shared/category/CategoryFilterCard";
import { CreateOrderSheet } from "@/components/shared/CreateOrderSheet";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { useCartStore } from "@/store/cart";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const DashboardPage: NextPageWithLayout = () => {
  const cartStore = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const { data : products } = api.product.getProducts.useQuery();
  const { data : categories }  = api.category.getCategories.useQuery();

 

  const handleAddToCart = (productId: string) => {
    const product = products?.find((product) => product.id === productId);
    if(!product){
      alert("Product not found"); return;
    }

    cartStore.addToCart({
      productId : product.id,
      name : product.name ?? "",
      price : product.price,
      image : product.image ?? "",
    })
  };

  const findProductCount = (categoryName : string) => {
    const count = products?.filter((product) => product.category.name === categoryName).length ?? 0;
    return count;
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };


  // filtered products
  const filteredProducts = useMemo(() => {
    return products?.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category.name === selectedCategory;
        // alert(selectedCategory);

       // search products
      const searchMatch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });

    
  }, [selectedCategory, searchQuery, products]);


  const quantity = cartStore.cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Dashboard </DashboardTitle>
            <DashboardDescription>
            Don&apos;t forget to checkout your products
            </DashboardDescription>
          </div>

         {
          !! quantity && (
            <Button
            className="animate-in slide-in-from-right"
            onClick={() => setOrderSheetOpen(true)}
          >
            
           
            <ShoppingCart />  &nbsp;  <Badge
              variant="default"
              className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums "
            >
              { quantity }
            </Badge>
          </Button>
          )
         }
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {categories?.map((category) => (
            <CategoryFilterCard
              key={category.id}
              name={category.name ?? ""}
              isSelected={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.name ?? "")}
              productCount={findProductCount(category.name ?? "")}
            />
          ))}
        </div>

          {
            !filteredProducts?.length ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredProducts?.map((product) => (
            <ProductMenuCard
              key={product.id}
              name = {product.name}
              price = {product.price}
              image = {product.image ?? ""}
              productId = {product.id}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
            )
          }
        
      </div>
            <Toaster/>


        
      <CreateOrderSheet
        open={ orderSheetOpen && quantity > 0}
        onOpenChange={setOrderSheetOpen}
      />
    </>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
