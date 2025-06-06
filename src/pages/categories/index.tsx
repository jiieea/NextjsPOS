/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";


const CategoriesPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const { data : products } = api.product.getProducts.useQuery(); // get products data

  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const { data : categories , isLoading : isLoadingCategories } = api.category.getCategories.useQuery(); // show data

  const { mutate : createCategory } = api.category.createNewCategory.useMutation({
    onSuccess : async() => {
      await apiUtils.category.getCategories.invalidate();
      toast.success("Category created successfully");
      setCreateCategoryDialogOpen(false);
      createCategoryForm.reset();
      setCreateCategoryLoading(false);
    }
  });

  const { mutate : deleteCategoryById } = api.category.deleteCategoryById.useMutation({
    onSuccess : async() => {
      await apiUtils.category.getCategories.invalidate();
      toast.success("Delete Category Success");
      setCategoryToDelete(null);
      setDeleteCategoryLoading(false);
    },
  })

  // handle update category
  const { mutate : updateCategory } = api.category.updateCategoryById.useMutation({
    onSuccess : async() => {
      await apiUtils.category.getCategories.invalidate();
      toast.success("Category Updated Successfully");
      editCategoryForm.reset();
      setEditCategoryDialogOpen(false);
      setCategoryToEdit(null);
    }
  })

  // handle submit create category
  const handleSubmitCreateCategory = (data: CategoryFormSchema) => {
    setCreateCategoryLoading(true);
    createCategory({
      name : data.name,
    })
  };

  // handle submit edit category
  const handleSubmitEditCategory = (data: CategoryFormSchema) => {
    if(!categoryToEdit) return;
    
    updateCategory({
      name : data.name,
      categoryId : categoryToEdit,
    })
  };

  const handleClickEditCategory = (category : { id : string; name : string;}) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category.id);
    editCategoryForm.reset({
      name: category.name ?? '',
    });
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };


  // handle confirm delete category
const handleConfirmDeleteCategory = () => { 
  if(!categoryToDelete) return;
  setDeleteCategoryLoading(true);
  deleteCategoryById({
    categoryId : categoryToDelete
  })
}

// handle product count
const handleProductCount = (categoryName : string) => {
  const productQty = products?.filter((product : { category : { name : string; }; }) => 
    product.category.name === categoryName
  ).length ?? 0;

  return productQty;
}

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createCategoryForm}>
                <CategoryForm
                  onSubmit={handleSubmitCreateCategory}
                  submitText="Create Category"
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={
                    createCategoryForm.handleSubmit(
                      handleSubmitCreateCategory,
                    )
                  }
                  disabled={createCategoryLoading}
                >
                  {createCategoryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-4 gap-4">
        {
          isLoadingCategories ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            // map the categories
            categories?.map((category) => {
              return (
                <CategoryCatalogCard
                  key={category.id}
                  name={category.name ?? ''}
                  productCound={handleProductCount(category.name ?? " ")}
                  onDelete={() => category.id && handleClickDeleteCategory(category.id)}
                  onEdit={() => category.id && handleClickEditCategory({
                    id : category.id,
                    name : category.name ?? '',
                  })}
                />
              )
})
        )}
        <Toaster />
      </div>

      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editCategoryForm}>
            <CategoryForm
              onSubmit={handleSubmitEditCategory}
              submitText="Edit Category"
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={
                editCategoryForm.handleSubmit(handleSubmitEditCategory)
              }
              disabled={editCategoryLoading}
            >
              {
                editCategoryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Edit Category"
                )
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleConfirmDeleteCategory} disabled={deleteCategoryLoading}>
              {
                deleteCategoryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Category"
                )
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

CategoriesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CategoriesPage;