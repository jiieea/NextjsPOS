import { FormControl, FormMessage } from "@/components/ui/form"
import { FormLabel } from "@/components/ui/form"
import { FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ProductFormSchema } from "@/forms/products"
import { api } from "@/utils/api"
import { useFormContext } from "react-hook-form"

export const ProductForm = () => {
    const form = useFormContext<ProductFormSchema>();
    const { data : categories } = api.category.getCategories.useQuery();
    return (
        <form action="">
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
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Category" />
                                </SelectTrigger>

                                <SelectContent>
                                    {
                                      categories?.map(category=> {
                                        return (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
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

        </form>
    )
}