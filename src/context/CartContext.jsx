import {
  createContext,
  useContext,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const [
    restaurantConflict,
    setRestaurantConflict,
  ] = useState(false);

  const [
    pendingItem,
    setPendingItem,
  ] = useState(null);


  /* ========================================
     CURRENT CART RESTAURANT
  ======================================== */

  const cartRestaurantId =
    cart.length > 0
      ? cart[0].restaurantId ??
        cart[0].restaurant_id ??
        null
      : null;


  /* ========================================
     ADD TO CART
  ======================================== */

  function addToCart(item) {
    const itemRestaurantId =
      item.restaurantId ??
      item.restaurant_id ??
      null;

    /*
      Cart already belongs to another
      restaurant.
    */

    if (
      cart.length > 0 &&
      cartRestaurantId !== null &&
      itemRestaurantId !== null &&
      Number(cartRestaurantId) !==
        Number(itemRestaurantId)
    ) {
      setPendingItem({
        ...item,
        restaurantId:
          itemRestaurantId,
      });

      setRestaurantConflict(true);

      return {
        conflict: true,
      };
    }


    /*
      Same restaurant:
      add normally.
    */

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (cartItem) =>
            Number(cartItem.id) ===
              Number(item.id) &&
            Number(
              cartItem.restaurantId ??
                cartItem.restaurant_id ??
                itemRestaurantId
            ) ===
              Number(itemRestaurantId)
        );

      if (existingItem) {
        return currentCart.map(
          (cartItem) =>
            Number(cartItem.id) ===
              Number(item.id)
              ? {
                  ...cartItem,

                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...currentCart,

        {
          ...item,

          restaurantId:
            itemRestaurantId,

          quantity: 1,
        },
      ];
    });

    return {
      conflict: false,
    };
  }


  /* ========================================
     CONFIRM RESTAURANT CHANGE
  ======================================== */

  function confirmRestaurantChange() {
    if (!pendingItem) {
      return;
    }

    const itemRestaurantId =
      pendingItem.restaurantId ??
      pendingItem.restaurant_id ??
      null;

    setCart([
      {
        ...pendingItem,

        restaurantId:
          itemRestaurantId,

        quantity: 1,
      },
    ]);

    setPendingItem(null);

    setRestaurantConflict(false);
  }


  /* ========================================
     CANCEL RESTAURANT CHANGE
  ======================================== */

  function cancelRestaurantChange() {
    setPendingItem(null);

    setRestaurantConflict(false);
  }


  /* ========================================
     QUANTITY
  ======================================== */

  function increaseQuantity(id) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        Number(item.id) === Number(id)
          ? {
              ...item,

              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }


  function decreaseQuantity(id) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          Number(item.id) === Number(id)
            ? {
                ...item,

                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }


  /* ========================================
     REMOVE
  ======================================== */

  function removeFromCart(id) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          Number(item.id) !==
          Number(id)
      )
    );
  }


  /* ========================================
     CLEAR
  ======================================== */

  function clearCart() {
    setCart([]);

    setPendingItem(null);

    setRestaurantConflict(false);
  }


  /* ========================================
     TOTALS
  ======================================== */

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          item.quantity,
      0
    );


  /* ========================================
     CONTEXT
  ======================================== */

  return (
    <CartContext.Provider
      value={{
        cart,

        addToCart,

        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,

        cartCount,
        subtotal,

        cartRestaurantId,

        restaurantConflict,
        pendingItem,

        confirmRestaurantChange,
        cancelRestaurantChange,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  return useContext(CartContext);
}