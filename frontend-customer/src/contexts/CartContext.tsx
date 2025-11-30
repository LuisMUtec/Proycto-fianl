import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cart';

interface CartItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  menu_item: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (menuItem: any, quantity?: number) => Promise<{ success: boolean; error?: any }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fridays_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    console.log('📦 CartProvider: Loading cart from localStorage');
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('📦 Loaded cart items:', parsed);
        setCartItems(parsed);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Cuando el usuario inicia sesión, cargar carrito del servidor
  useEffect(() => {
    if (user && profile) {
      console.log('🔄 User logged in, fetching cart from server');
      fetchCartFromServer();
    }
  }, [user, profile]);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cartItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartItems]);

  // Obtener carrito del servidor
  const fetchCartFromServer = async () => {
    if (!user || !profile) return;

    try {
      console.log('🔄 Fetching cart from server...');
      const serverCart = await cartService.getCart();
      console.log('📦 Server cart:', serverCart);

      if (serverCart && serverCart.items && serverCart.items.length > 0) {
        // Convertir items del servidor al formato local
        const localItems: CartItem[] = serverCart.items.map((item, index) => ({
          id: `server-${item.productId}-${index}`,
          menu_item_id: item.productId,
          quantity: item.quantity,
          menu_item: {
            id: item.productId,
            name: item.name || 'Producto',
            price: item.price || 0,
            image_url: item.imageUrl,
          },
        }));
        setCartItems(localItems);
        console.log('✅ Cart loaded from server:', localItems);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch cart from server:', error);
    }
  };

  // Sincronizar carrito local con servidor
  const syncWithServer = async () => {
    if (!user || !profile) {
      console.log('No user logged in, skipping sync');
      return;
    }

    if (cartItems.length === 0) {
      console.log('Cart is empty, nothing to sync');
      return;
    }

    try {
      console.log('🔄 Syncing cart with server...');

      // Preparar items en formato del backend
      const itemsToSync = cartItems.map(item => ({
        productId: item.menu_item_id,
        name: item.menu_item.name,
        quantity: item.quantity,
        price: item.menu_item.price,
        imageUrl: item.menu_item.image_url,
      }));

      // Usar la función que intenta POST /cart primero, luego /cart/sync
      await cartService.syncLocalCartToServer(itemsToSync);
      console.log('✅ Cart synced with server');
    } catch (error) {
      console.warn('⚠️ Could not sync cart with server:', error);
      throw error; // Re-throw para que el checkout sepa que falló
    }
  };

  const addToCart = async (menuItem: any, quantity: number = 1) => {
    try {
      setLoading(true);

      console.log('🛒 Adding to cart:', menuItem);

      const productId = menuItem.id || menuItem.productId;

      // Actualizar estado local primero
      const existingItem = cartItems.find(item => item.menu_item_id === productId);

      if (existingItem) {
        console.log('Item exists, updating quantity');
        const newQuantity = existingItem.quantity + quantity;
        setCartItems(items =>
          items.map(item =>
            item.menu_item_id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        console.log('Adding new item to cart');
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          menu_item_id: productId,
          quantity,
          menu_item: {
            id: productId,
            name: menuItem.name,
            price: menuItem.price,
            image_url: menuItem.image_url || menuItem.imageUrl,
          },
        };
        setCartItems(items => [...items, newItem]);
      }

      // Agregar al servidor si hay usuario logueado
      if (user && profile) {
        try {
          await cartService.addToCart(productId, quantity);
          console.log('✅ Item added to server cart');
        } catch (error) {
          console.warn('⚠️ Could not add item to server (will sync later):', error);
          // No fallar - el sync al checkout lo intentará de nuevo
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      console.log('Update quantity:', { cartItemId, quantity });

      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const item = cartItems.find(i => i.id === cartItemId);
      if (!item) return;

      setCartItems(items =>
        items.map(i =>
          i.id === cartItemId ? { ...i, quantity } : i
        )
      );

      // Actualizar en servidor (el sync completo se hará en checkout)
      if (user && profile) {
        try {
          await cartService.updateCartItem(item.menu_item_id, quantity);
          console.log('✅ Item quantity updated on server');
        } catch (error) {
          console.warn('⚠️ Could not update on server (will sync at checkout):', error);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      console.log('Remove from cart:', cartItemId);

      setCartItems(items => items.filter(i => i.id !== cartItemId));

      // No intentar eliminar del servidor individualmente
      // El sync completo se hará en checkout
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      console.log('Clear cart');

      setCartItems([]);

      // Limpiar en servidor también
      if (user && profile) {
        try {
          await cartService.clearCart();
          console.log('✅ Cart cleared on server');
        } catch (error) {
          console.warn('⚠️ Could not clear cart on server:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncWithServer,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
