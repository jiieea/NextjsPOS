/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Category } from "@prisma/client";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
    // get all categories
    getCategories : protectedProcedure.query(async({ ctx }): Promise<Partial<Category>[]> => {
        const { db }= ctx; // destruct the object
        const categories = await db.category.findMany({
            select : {
                id : true,
                name : true,
                productCound : true,
            }
        });

        return categories;
    }),

    // create a new category
    createNewCategory : protectedProcedure.input(
        z.object({
            name : z.string().min(3, "Name must be at least 3 characters long"),
        })
    ).mutation(async({ ctx , input }) => {
        const { db } = ctx;
        const category = await db.category.create({
            data : {
                name : input.name
            },
            select : {
                id : true,
                name : true,
                productCound : true,
            }
        });

        return category;
    }),

      // delete category
      deleteCategoryById : protectedProcedure.input(z.object({
        categoryId : z.string(),
      })).mutation(async({ ctx  , input}) => {
          const { db } = ctx;
          await db.category.delete({
            where : {
                id : input.categoryId,
            }
          })
      }),

      // update category
      updateCategoryById : protectedProcedure.input(z.object({
        categoryId : z.string(),
        name : z.string().min(3 , "Name must be at least 3 characters long"),
      })).mutation(async({ ctx , input}) => {
        const { db } = ctx;
        const updatedCategory= await db.category.update({
            where : {
                id : input.categoryId,
            },
            data  : {
                name : input.name,
            },
            select :{
                id : true,
                name : true,
                productCound : true,
            }
        });

        return updatedCategory;
      })
})