import { z } from "zod";

export const productFormSchema = z.object({
    name : z.string().min(1).max(20),
    price : z.number().min(50000),
    categoryId : z.string()
})

export type ProductFormSchema = z.infer<typeof productFormSchema> 