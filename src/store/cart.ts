import { toast } from 'sonner'
import { create } from 'zustand'

type CartItem = {
  name : string;
  price : number;
  image : string;
  quantity : number;
  productId : string;
}

type AddToCartItem = Omit<CartItem, 'quantity'>

interface CartState {
  cart : CartItem[],
  addToCart: (items : AddToCartItem) => void,
  updateQuantity: (productId: string, quantity: number) => void
}

export const useCartStore = create<CartState>()((set) => ({
  cart : [],
  addToCart: (items) => {
    set((currentState) => {
      // duplicate state 
      // currentState = immuteable
      const duplicate = [...currentState.cart];
     

      const existingItemIndex = duplicate.findIndex((item) => item.productId === items.productId)

      if(existingItemIndex == -1) {
        duplicate.push({
        name : items.name,
        price : items.price,
        image : items.image,
        quantity : 1,
        productId : items.productId
      });
      toast.success(`${items.name} added to cart`)
      }else {
        const itemToUpdate = duplicate[existingItemIndex];
        if(!itemToUpdate) {
          return{
            ...currentState,
          }
        }

        itemToUpdate.quantity += 1;
        toast.success(`${items.name} added to cart`)
      }
      return {
        ...currentState,
        cart : duplicate
      }
    })
  },
  updateQuantity: (productId, quantity) => {
    set((state) => {
      const updatedCart = state.cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: Math.max(0, item.quantity + quantity) }
          : item
      );
      // remove item if quantity is 0
      const filteredCart = updatedCart.filter(item => item.quantity > 0);
      return { ...state, cart: filteredCart };
    });
  }
}))
