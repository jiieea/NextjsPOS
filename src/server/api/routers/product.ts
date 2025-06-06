import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "../../supabase-admin";
import { TRPCError } from "@trpc/server";
import { Bucket } from "@/server/bucket";

export const productRouter = createTRPCRouter({
    getProducts : protectedProcedure.query(async({ ctx }) => {
        const { db } = ctx;
        const products = await db.product.findMany({
            select : {
                id : true,
                name : true,
                price : true,
                image : true,
                
                category : {
                    select : {
                        id : true,
                        name : true,
                    }
                }
            }
        });
        return products;
    }),

    // get products by category

    // create a new product
    createNewProduct  : protectedProcedure.input(
        z.object({
            name : z.string().min(1, "Name is required"),
            price : z.number().min(50000, "Price must be at least 50000"),
            categoryId: z.string(),
            image : z.string().url()
        })
    ).mutation(async({ ctx , input }) => {
        const { db } = ctx;
        const product = await db.product.create({
            data : {
                name : input.name,
                price : input.price,
                category : {
                    connect : {
                        id : input.categoryId
                    }
                },
                image : input.image
            }
        });
        return product;
    }),

    createProductImageUploadUrl : protectedProcedure.mutation(async() => {
        const { data , error } = await supabaseAdmin.storage.from(
           Bucket.ProductImages
        ).createSignedUploadUrl(
            `${Date.now()}.jpeg`
        )

        if(error) {
            throw new TRPCError({
                code : "INTERNAL_SERVER_ERROR",
                message : error.message
            })
        }
        return data;
    }),

    // delete a product
   deleteProductById : protectedProcedure.input(
    z.object({
        productId : z.string()
    })
   )
   .mutation(async({ ctx , input }) => {
    const { db } = ctx;
    // delete the product from the database
    await db.product.delete({
        where : {
            id : input.productId
        }
    })
}),


    // update a product
    updateProductById : protectedProcedure.input(
        z.object({
            productId : z.string(),
            name : z.string().min(1, "Name is required"),
            price : z.number().min(50000, "Price must be at least 50000"),
            categoryId : z.string(),
            image : z.string().url()
        })
    )
   .mutation(async({ ctx , input }) => {
    const { db } = ctx;
    const updateProduct = await db.product.update({
        where : {
            id : input.productId
        }, 
        data : {
            name : input.name,
            price : input.price,
            category : {
                connect : {
                    id : input.categoryId
                }
            },
            image : input.image
        },
        select : {
            id : true,
            name : true,
            price : true,
            image : true,
        }
    })
    return updateProduct;
   })
});