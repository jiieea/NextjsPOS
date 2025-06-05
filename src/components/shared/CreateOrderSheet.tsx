import { Button } from "../ui/button";
import { toRupiah } from "@/utils/toRupiah";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { PaymentQRCode } from "./PaymentQrCode";
import { useCartStore } from "@/store/cart";
import { api } from "@/utils/api";
import { toast } from "sonner";

type OrderItemProps = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const OrderItem = ({ id, name, price, quantity, image }: OrderItemProps) => {
  const cartStore = useCartStore();
  return (
    <div className="flex gap-3" key={id}>
      <div className="relative aspect-square h-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      <div className="flex w-full flex-col justify-between">
        <div className="flex flex-col">
          <p>{name}</p>
          <p className="text-muted-foreground text-sm">
            {toRupiah(price)} x {quantity}
          </p>
        </div>

        <div className="flex w-full justify-between">
          <p className="font-medium">{toRupiah(quantity * price)}</p>

          <div className="flex items-center gap-3">
            <button className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full p-1">
              <Minus className="h-4 w-4" onClick={() => cartStore.updateQuantity(id, -1)} />
            </button>

            <span className="text-sm">{quantity}</span>

            <button className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full p-1">
              <Plus className="h-4 w-4" onClick={() => cartStore.updateQuantity(id, 1)} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type CreateOrderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateOrderSheet = ({
  open,
  onOpenChange,
}: CreateOrderSheetProps) => {
  const cartStore = useCartStore();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const subtotal = cartStore.cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  const tax = useMemo(() => subtotal * 0.17, [subtotal]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);
  const discount = useMemo(() => {
    if (subtotal < 100000) return 0;
    if (subtotal < 200000) return 0.05;
    if (subtotal < 300000) return 0.1;
    return 0.15;
  }, [subtotal]);
  const discountAmount = useMemo(() => subtotal * discount, [subtotal, discount]);

  const { mutate : createOrder , data : createOrderDataResponse } = api.order.createOrder.useMutation({
   onSuccess : () => {
    toast.success("Order created successfully");
    setPaymentDialogOpen(true);
   },
   
    
  })
  const handleCreateOrder = () => {
   createOrder({
    orderItems : cartStore.cart.map((item) => {
      return {
        productId : item.productId,
        quantity : item.quantity,
      }
    })
   })
  };

  const handleRefresh = () => {
    setPaymentSuccess(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle className="text-2xl">Create New Order</SheetTitle>
            <SheetDescription>
              Add products to your cart and create a new order.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-scroll p-4">
            <h1 className="text-xl font-medium">Order Items</h1>
            <div className="flex flex-col gap-6">
              {
                cartStore.cart.map((item) => {
                  return (
                    <OrderItem
                      key={item.productId}
                      id={item.productId}
                      name={item.name}
                      price={item.price}
                      quantity={item.quantity}
                      image={item.image}
                    />
                  )
                })
              }
            </div>
          </div>

          <SheetFooter>
            <h3 className="text-lg font-medium">Payment Details</h3>

            <div className="grid grid-cols-2 gap-2">
              <p>Subtotal</p>
              <p className="place-self-end">{toRupiah(subtotal)}</p>

              <p>Tax</p>
              <p className="place-self-end">{toRupiah(tax)}</p>

              <Separator className="col-span-2" />

              <p>Discount</p>
              <p className="place-self-end">{toRupiah(discountAmount)}</p>

              <p>Total</p>
              <p className="place-self-end text-muted-foreground text-sm line-through">{toRupiah(grandTotal)}</p>
              <p></p>
              <p className="place-self-end ">
                {toRupiah(subtotal + tax - discountAmount)}
              </p>
            </div>

            <Button
              size="lg"
              className="mt-8 w-full"
              onClick={handleCreateOrder}
            >
              Create Order
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium">Finish Payment</p>

            {paymentInfoLoading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="border-primary h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-l-2" />

                <p>Loading...</p>
              </div>
            ) : (
              <>
                <Button variant="link" onClick={handleRefresh}>
                  Refresh
                </Button>

                {!paymentSuccess ? (
                  <PaymentQRCode qrString={createOrderDataResponse?.qrString ?? ""}/>
                ) : (
                  <CheckCircle2 className="size-80 text-green-500" />
                )}

                <p className="text-3xl font-medium">{toRupiah(createOrderDataResponse?.order.grandTotal ?? 0)}</p>

                <p className="text-muted-foreground text-sm">
                  Transaction ID: {createOrderDataResponse?.order.id}
                </p>
              </>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                disabled={paymentInfoLoading}
                variant="outline"
                className="w-full"
              >
                Done
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
