import { z } from "zod";

export const productFormSchema = z.object({
    name : z.string().min(1),
    price : z.coerce.number().min(50000),
    categoryId : z.string(),
    image : z.string().optional()
})

export type ProductFormSchema = z.infer<typeof productFormSchema> 