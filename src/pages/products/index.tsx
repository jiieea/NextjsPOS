import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { useForm } from "react-hook-form";
import { productFormSchema, ProductFormSchema } from "@/forms/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useState } from "react";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [uploadImageUrl, setUploadImageUrl] = useState<string | null>(null);
  const [createProductDialogOpen, setCreateProductDialogOpen] =
  useState(false);
  const { data : products , isLoading : isLoadingProducts } = api.product.getProducts.useQuery();

  const createProductForm = useForm<ProductFormSchema>({
    resolver : zodResolver(productFormSchema),
  });

  const { mutate : createProduct } = api.product.createNewProduct.useMutation({
    onSuccess : async() => {
      await apiUtils.product.getProducts.invalidate();
      createProductForm.reset();
      alert("Product created successfully");
      setCreateProductDialogOpen(false);
    }
  })

  const handleSubmitCreateProduct =  (values : ProductFormSchema) => {
   if(!uploadImageUrl) {
    alert("Please upload an image");
    return;
   }

    createProduct({
      name : values.name,
      price : values.price,
      categoryId : values.categoryId,
      image : uploadImageUrl,
    });
  }
  
  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

        {/* alertDialog */}
        <AlertDialog
        open={createProductDialogOpen}
        onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Product</AlertDialogTitle>
              </AlertDialogHeader>
            <Form {...createProductForm}>
            <ProductForm 
              onSubmit={handleSubmitCreateProduct}
              onChangeImageUrl={(imageUrl) => {
                setUploadImageUrl(imageUrl);
              }}
            />
            </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                onClick = { createProductForm.handleSubmit(handleSubmitCreateProduct)}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {
          products?.map((product) => {
            return (
              <ProductCatalogCard
                key={product.id}
                name={product.name}
                price={product.price}
                image={product.image ?? ""}
                category={product.category.name}
              />
            )
          })
        }
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
