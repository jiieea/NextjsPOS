import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import { z } from "zod";
import { createQRISPayment } from "@/server/xendit";

export const orderRouter = createTRPCRouter({
    createOrder : protectedProcedure.input(
        z.object({
            orderItems : z.array(
                z.object({
                    productId : z.string(),
                    quantity : z.number().min(1),
                }),
            )
        })
    ).mutation(
        async({ ctx , input }) => {
            const { db } = ctx;
            const { orderItems } = input;

            // real data from db of products we add to cart
            const products = await db.product.findMany({
                where : {
                    id : {
                        in : orderItems.map((item) => 
                            item.productId
                        ),
                    },
                }
            })

            // calculate total price
            let subtotal = 0;
            products.forEach(product => {
                const productQuantity = orderItems.find(
                    (item) => item.productId === product.id
                )!.quantity;

                if(productQuantity) {
                    subtotal += product.price * productQuantity;
                }
            });

            // calculate tax
            const tax = subtotal * 0.1;

            // calculate total
            const total = subtotal + tax;
            // add discount
            const discount = 0;

            // create order
            const order = await db.order.create({
                data : {
                    subTotal: subtotal,
                    tax,
                    grandTotal: total,
                    discount,
                    paymentMethod: "QRIS"
                }
            })

            // create qris payment
            const paymentReq = await createQRISPayment({
                amout : total,
                orderId : order.id,
            })

            // create order items
            const newOrderItems = await db.orderItem.createMany({
                data: products
                    .map((product) => {
                        const productQuantity = orderItems.find(
                            item => item.productId === product.id
                        )?.quantity;

                        if (productQuantity) {
                            return {
                                orderId: order.id,
                                productId: product.id,
                                quantity: productQuantity,
                                price: product.price,
                            }
                        }
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== undefined)
            })

            return {
                order,
                orderItems: newOrderItems,
                qrString: paymentReq.paymentMethod.qrCode?.channelProperties?.qrString,
            }
            
        
            
            
            
        }
    ),
})
