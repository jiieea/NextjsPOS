import { FormControl, FormMessage } from "@/components/ui/form"
import { FormLabel } from "@/components/ui/form"
import { FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ProductFormSchema } from "@/forms/products"
import { uploadFileToSignedUrl } from "@/lib/supabase"
import { Bucket } from "@/server/bucket"

import { api } from "@/utils/api"
import { useFormContext } from "react-hook-form"

type ProductFormProps = {
    onSubmit : (values : ProductFormSchema) => void;
    onChangeImageUrl : (image : string) => void
}

export const ProductForm = ({ onSubmit , onChangeImageUrl }: ProductFormProps) => {
    const form = useFormContext<ProductFormSchema>();
    const { data : categories } = api.category.getCategories.useQuery();

    const { mutateAsync : createProductImageUploadUrl } = api.product.createProductImageUploadUrl.useMutation();

    const imageChangeHandler = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if(files && files.length > 0) {
            const file = files[0];
            if(!file ) return;

            const { path , token } = await createProductImageUploadUrl();

            const imageUrl = await uploadFileToSignedUrl({
                bucket : Bucket.ProductImages,
                file,
                path,
                token
            })

        onChangeImageUrl(imageUrl);
        alert("Image uploaded successfully");
        }
    }
   
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Price</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Price</FormLabel>
                        <FormControl>
                           <Select
                            value={field.value}
                            onValueChange={(value : string) => {
                                field.onChange(value);
                            }}
                           >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Category" />
                                </SelectTrigger>

                                <SelectContent>
                                    {
                                      categories?.map(category=> {
                                        return (
                                            <SelectItem key={category?.id ?? ''} value={category?.id?.toString() ?? ''}>
                                                {category?.name}
                                            </SelectItem>
                                        )
                                      })
                                    }
                                    
                                </SelectContent>
                            <FormItem>
                                
                            </FormItem>
                           </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div>
                {/* form upload image */}
                <label className="space-y-4">Product Image </label>
                <input type="file" accept="image/*" onChange={imageChangeHandler} />
            </div>

        </form>
    )
}