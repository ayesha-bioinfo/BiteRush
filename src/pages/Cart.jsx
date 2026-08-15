import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  BadgePercent,
  CheckCircle2,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    cartRestaurantId,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const normalDeliveryFee =
    cart.length > 0 ? 2.49 : 0;

  const serviceFee =
    cart.length > 0 ? subtotal * 0.05 : 0;

  const discountAmount =
    appliedOffer?.discountAmount || 0;

  const deliveryFee =
    appliedOffer?.freeDelivery
      ? 0
      : normalDeliveryFee;

  const total = Math.max(
    0,
    subtotal -
      discountAmount +
      deliveryFee +
      serviceFee
  );

  async function applyPromo() {
    if (!promoCode.trim()) {
      setPromoError("Enter a promo code first.");
      setPromoMessage("");
      return;
    }

    try {
      setValidatingPromo(true);
      setPromoError("");
      setPromoMessage("");

      const response = await fetch(
        "http://localhost:5000/api/offers/validate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            code: promoCode.trim(),
            subtotal,
            restaurantId: cartRestaurantId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(
          data.message || "Promo code is not valid."
        );
      }

      setAppliedOffer(data.offer);

      setPromoCode(data.offer.code);

      setPromoMessage(
        data.message || "Promo applied successfully!"
      );
    } catch (error) {
      console.error("PROMO ERROR:", error);

      setAppliedOffer(null);

      setPromoError(
        error.message ||
          "Unable to apply this promo code."
      );
    } finally {
      setValidatingPromo(false);
    }
  }

  function removePromo() {
    setAppliedOffer(null);
    setPromoCode("");
    setPromoMessage("");
    setPromoError("");
  }

  function handlePromoChange(event) {
    setPromoCode(event.target.value.toUpperCase());

    setPromoError("");

    /*
      If the user changes an already applied code,
      remove the old discount.
    */
    if (appliedOffer) {
      setAppliedOffer(null);
      setPromoMessage("");
    }
  }

  function handleCheckout() {
    const checkoutOffer = appliedOffer
      ? {
          ...appliedOffer,
          discountAmount,
        }
      : null;

    sessionStorage.setItem(
      "biterush-checkout-offer",
      JSON.stringify(checkoutOffer)
    );

    navigate("/checkout");
  }

  if (cart.length === 0) {
    return (
      <main className="cart-page">

        <div className="empty-cart">

          <div className="empty-cart-icon">
            <ShoppingBag size={38} />
          </div>

          <h1>Your cart is empty</h1>

          <p>
            Looks like you haven't added anything
            delicious yet.
          </p>

          <button onClick={() => navigate("/")}>
            Explore restaurants
            <ArrowRight size={18} />
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="cart-page">

      <div className="cart-container">

        <button
          className="cart-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Continue shopping
        </button>


        <div className="cart-title">

          <div>
            <span>YOUR ORDER</span>

            <h1>Your cart</h1>

            <p>
              Review your items before checkout.
            </p>
          </div>

          <button
            className="clear-cart"
            onClick={clearCart}
          >
            <Trash2 size={16} />
            Clear cart
          </button>

        </div>


        <div className="cart-layout">

          {/* LEFT SIDE */}

          <section className="cart-items">

            {cart.map((item) => (

              <article
                className="cart-item"
                key={item.id}
              >

<div className="cart-item-image">

  {item.displayImage ? (
    <img
      src={item.displayImage}
      alt={item.name}
    />
  ) : (
    <span>
      {item.image}
    </span>
  )}

</div>

                <div className="cart-item-info">

                  <span className="cart-item-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>


                  <div className="cart-item-controls">

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        <Minus size={15} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        <Plus size={15} />
                      </button>

                    </div>


                    <button
                      className="remove-item"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>

                  </div>

                </div>


                <div className="cart-item-price">

                  <span>
                    ${item.price.toFixed(2)} each
                  </span>

                  <strong>
                    $
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                </div>

              </article>

            ))}

          </section>


          {/* RIGHT SIDE */}

          <aside className="order-summary">

            <span className="summary-label">
              ORDER SUMMARY
            </span>

            <h2>Payment details</h2>


            {/* PROMO CODE */}

            <div className="cart-promo">

              <div className="cart-promo-title">
                <BadgePercent size={17} />

                <span>
                  Have a promo code?
                </span>
              </div>


              {!appliedOffer ? (

                <div className="promo-input-row">

                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={handlePromoChange}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applyPromo();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={validatingPromo}
                  >
                    {validatingPromo
                      ? "Checking..."
                      : "Apply"}
                  </button>

                </div>

              ) : (

                <div className="applied-promo">

                  <div>

                    <CheckCircle2 size={17} />

                    <div>
                      <strong>
                        {appliedOffer.code}
                      </strong>

                      <span>
                        {appliedOffer.freeDelivery
                          ? "Free delivery applied"
                          : `$${discountAmount.toFixed(
                              2
                            )} discount applied`}
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={removePromo}
                    aria-label="Remove promo"
                  >
                    <X size={16} />
                  </button>

                </div>

              )}


              {promoMessage && (
                <p className="promo-success">
                  {promoMessage}
                </p>
              )}

              {promoError && (
                <p className="promo-error">
                  {promoError}
                </p>
              )}

            </div>


            <div className="summary-lines">

              <div>
                <span>Subtotal</span>

                <strong>
                  ${subtotal.toFixed(2)}
                </strong>
              </div>


              {appliedOffer &&
                discountAmount > 0 && (

                  <div className="discount-line">

                    <span>
                      Discount ({appliedOffer.code})
                    </span>

                    <strong>
                      -${discountAmount.toFixed(2)}
                    </strong>

                  </div>
                )}


              <div>
                <span>Delivery fee</span>

                <strong>
                  {appliedOffer?.freeDelivery
                    ? "FREE"
                    : `$${deliveryFee.toFixed(2)}`}
                </strong>
              </div>


              <div>
                <span>Service fee</span>

                <strong>
                  ${serviceFee.toFixed(2)}
                </strong>
              </div>

            </div>


            <div className="summary-total">

              <div>
                <span>Total</span>

                <strong>
                  ${total.toFixed(2)}
                </strong>
              </div>

              <p>
                Taxes calculated at checkout.
              </p>

            </div>


            <button
              className="checkout-button"
              onClick={handleCheckout}
            >
              Proceed to checkout
              <ArrowRight size={18} />
            </button>


            <div className="secure-checkout">

              <ShieldCheck size={18} />

              <div>
                <strong>
                  Secure checkout
                </strong>

                <span>
                  Promo codes are verified securely
                  by BiteRush.
                </span>
              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;