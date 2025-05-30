import { createTRPCRouter, publicProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
    getProducts : publicProcedure.query(async({ ctx }) => {
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
    })
});