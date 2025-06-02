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
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { useForm } from "react-hook-form";
import { productFormSchema } from "@/forms/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import type { ProductFormSchema } from "@/forms/products";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [ isCreatingProduct, setIsCreatingProduct ] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState<string | null>(null);
  const [createProductDialogOpen, setCreateProductDialogOpen] =
  useState(false);
  const [editProductDialogOpen , setEditProductDialogOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [ productToDelete , setProductToDelete ] = useState<string | null>(null);
  const { data : products , isLoading : isLoadingProducts } = api.product.getProducts.useQuery();
  const [productToEdit , setProductToEdit] = useState<string | null>(null);

  const createProductForm = useForm<ProductFormSchema>({
    resolver : zodResolver(productFormSchema),
  });

  const updateProductForm = useForm<ProductFormSchema>({
    resolver : zodResolver(productFormSchema),
  })
  const { mutate : createProduct } = api.product.createNewProduct.useMutation({
    onSuccess : async() => {
      await apiUtils.product.getProducts.invalidate();
      createProductForm.reset();
      toast("Product created successfully");
      setCreateProductDialogOpen(false);
      setIsCreatingProduct(false);
    },
    onError : (error) => {
      toast.error(error.message);
    }
  })

  const { mutate : deleteProduct } = api.product.deleteProductById.useMutation({
    onSuccess : async() => {
      await apiUtils.product.getProducts.invalidate(); // invalidate the query
      toast("Product deleted successfully");
      setProductToDelete(null);
      setIsDeletingProduct(false);
    }
  });

  // delete product handler 
  const handleClickDeleteProduct = (productId : string) => {
    setProductToDelete(productId);
  }

  // confirm delete product
  const handleConfirmDeleteProduct = () => {
    if(!productToDelete) return;

    setIsDeletingProduct(true);
    deleteProduct({
      productId : productToDelete,
    })
 
  }

  const handleSubmitCreateProduct =  (values : ProductFormSchema) => {
   if(!uploadImageUrl) {
    toast("Please upload an image");
    return;
   }
   
   setIsCreatingProduct(true);
    createProduct({
      name : values.name,
      price : values.price,
      categoryId : values.categoryId,
      image : uploadImageUrl,
    });
  }

  // handle edit product
  const { mutate : editProduct } = api.product.updateProductById.useMutation({
    onSuccess : async() => {
      await apiUtils.product.getProducts.invalidate(); // invalidate the query
      toast("Product updated successfully");
      updateProductForm.reset();
      setEditProductDialogOpen(false);
      setProductToEdit(null);
    }
  })
  
  const handleClickEditProduct = (product : { id : string; name : string; price : number; categoryId : string; image : string | null;}) => {
    setEditProductDialogOpen(true);
    setProductToEdit(product.id);
    updateProductForm.reset({
      name : product.name,
      price : product.price,
      categoryId : product.categoryId,
    })
  }

  const handleSubmitUpdateProduct = (values : ProductFormSchema) => {

    if(!uploadImageUrl) {
      toast("Please upload an image");
      return;
    }

    if(!productToEdit) return;
    editProduct({
      name : values.name,
      price : values.price,
      image : uploadImageUrl,
      categoryId : values.categoryId,
      productId : productToEdit,
    })

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
                  {
                    isCreatingProduct ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ): (
                      "Create Product"
                    )
                  }
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {
          isLoadingProducts ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            products?.map((product) => {
              return (
                <ProductCatalogCard
                  key={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image ?? ""}
                  category={product.category.name}
                  onDelete={
                    () => handleClickDeleteProduct(product.id)
                  }
                  onEdit={() => product.id && handleClickEditProduct({
                    id : product.id,
                    name : product.name,
                    price : product.price,
                    categoryId : product.category.id,
                    image : product.image,
                  })}
                />
              )
            })
          )
        }
      </div>

        <AlertDialog
       open={editProductDialogOpen}
       onOpenChange={setEditProductDialogOpen}
        >
          <AlertDialogContent>
            <Form {...updateProductForm}>
              <ProductForm 
                onSubmit={handleSubmitUpdateProduct}
                onChangeImageUrl={(url) => {
                  setUploadImageUrl(url);
                }}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={updateProductForm.handleSubmit(handleSubmitUpdateProduct)}>Update Product</Button>
              </AlertDialogFooter>
            </Form>
          </AlertDialogContent>
        </AlertDialog>


      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if(!open) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDeleteProduct}>
              {
                // if the product is being deleted, show a loading spinner
                isDeletingProduct ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
