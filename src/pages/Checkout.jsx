import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Clock3,
  CreditCard,
  Banknote,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  BadgePercent,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "./Checkout.css";

function Checkout() {
const {
  token,
  isAuthenticated,
  authLoading,
} = useAuth();
  const navigate = useNavigate();

  const {
    cart,
    subtotal,
    clearCart,
  } = useCart();

  /* ========================================
     PROMO FROM CART
  ======================================== */

  const [appliedOffer] = useState(() => {
    try {
      const storedOffer = sessionStorage.getItem(
        "biterush-checkout-offer"
      );

      return storedOffer
        ? JSON.parse(storedOffer)
        : null;
    } catch (error) {
      console.error(
        "Unable to read checkout promo:",
        error
      );

      return null;
    }
  });

  /* ========================================
     CHECKOUT STATE
  ======================================== */

  const [deliveryMethod, setDeliveryMethod] =
    useState("standard");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    instructions: "",
  });

  const [errors, setErrors] = useState({});

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  /* ========================================
     DISPLAY TOTALS
     Backend will verify these again.
  ======================================== */

  const standardDelivery = 2.49;
  const priorityDelivery = 4.99;

  const normalDeliveryFee =
    deliveryMethod === "priority"
      ? priorityDelivery
      : standardDelivery;

  const discountAmount =
    appliedOffer?.discountAmount || 0;

  const deliveryFee =
    appliedOffer?.freeDelivery
      ? 0
      : normalDeliveryFee;

  const serviceFee =
    Math.round(
      subtotal * 0.05 * 100
    ) / 100;

  const total =
    Math.round(
      (
        subtotal -
        discountAmount +
        deliveryFee +
        serviceFee
      ) * 100
    ) / 100;

  /* ========================================
     FORM
  ======================================== */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Delivery address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  /* ========================================
     PLACE ORDER
  ======================================== */

  async function handlePlaceOrder() {
    if (!isAuthenticated || !token) {
  navigate("/signin");
  return;
}
    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setOrderError(
        "Your cart is empty."
      );

      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError("");

      /*
        IMPORTANT:

        We are NOT sending subtotal,
        delivery fee, service fee,
        total or item prices.

        The backend calculates those
        values securely from PostgreSQL.
      */

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

          body: JSON.stringify({
            customerName:
              formData.name,

            customerPhone:
              formData.phone,

            deliveryAddress:
              formData.address,

            city:
              formData.city,

            deliveryInstructions:
              formData.instructions,

            deliveryMethod,

            paymentMethod,

            promoCode:
              appliedOffer?.code || null,

            items: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place order"
        );
      }

      /*
        Use SERVER values here.

        These are the authoritative
        verified totals.
      */

      const savedOrder = {
        id:
          data.order.orderNumber,

        databaseId:
          data.order.id,

        customer:
          formData,

        items:
          cart,

        restaurantId:
          data.order.restaurantId,

        deliveryMethod,

        paymentMethod,

        subtotal:
          data.order.subtotal,

        promoCode:
          data.order.promoCode,

        discountAmount:
          data.order.discountAmount,

        deliveryFee:
          data.order.deliveryFee,

        serviceFee:
          data.order.serviceFee,

        total:
          data.order.total,

        status:
          data.order.status,

        createdAt:
          data.order.createdAt,
      };

      localStorage.setItem(
        "biterush-last-order",
        JSON.stringify(savedOrder)
      );

      /*
        Promo belongs only to this
        checkout session.
      */

      sessionStorage.removeItem(
        "biterush-checkout-offer"
      );

      clearCart();

      navigate("/order-success");
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setOrderError(
        error.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  /* ========================================
     EMPTY CART
  ======================================== */

  if (cart.length === 0) {
    return (
      <main className="checkout-empty">

        <div>

          <h1>
            No items to checkout
          </h1>

          <p>
            Add something delicious
            to your cart first.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Browse restaurants
            <ArrowRight size={18} />
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        <button
          className="checkout-back"
          onClick={() =>
            navigate("/cart")
          }
        >
          <ArrowLeft size={18} />
          Back to cart
        </button>


        <div className="checkout-heading">

          <span>
            FINAL STEP
          </span>

          <h1>
            Checkout
          </h1>

          <p>
            Confirm your delivery details
            and payment preference.
          </p>

        </div>


        <div className="checkout-layout">

          {/* =========================
              LEFT SIDE
          ========================== */}

          <div className="checkout-main">

            {/* DELIVERY INFORMATION */}

            <section className="checkout-card">

              <div className="checkout-section-title">

                <div className="checkout-title-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <span>
                    STEP 01
                  </span>

                  <h2>
                    Delivery information
                  </h2>
                </div>

              </div>


              <div className="checkout-form">

                <div className="form-group">

                  <label>
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                  {errors.name && (
                    <span className="form-error">
                      {errors.name}
                    </span>
                  )}

                </div>


                <div className="form-group">

                  <label>
                    Phone number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  {errors.phone && (
                    <span className="form-error">
                      {errors.phone}
                    </span>
                  )}

                </div>


                <div className="form-group form-full">

                  <label>
                    Delivery address
                  </label>

                  <input
                    type="text"
                    name="address"
                    placeholder="House, street and area"
                    value={formData.address}
                    onChange={handleChange}
                  />

                  {errors.address && (
                    <span className="form-error">
                      {errors.address}
                    </span>
                  )}

                </div>


                <div className="form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />

                  {errors.city && (
                    <span className="form-error">
                      {errors.city}
                    </span>
                  )}

                </div>


                <div className="form-group">

                  <label>
                    Delivery instructions
                  </label>

                  <input
                    type="text"
                    name="instructions"
                    placeholder="Optional instructions"
                    value={
                      formData.instructions
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

            </section>


            {/* DELIVERY OPTION */}

            <section className="checkout-card">

              <div className="checkout-section-title">

                <div className="checkout-title-icon">
                  <Bike size={20} />
                </div>

                <div>
                  <span>
                    STEP 02
                  </span>

                  <h2>
                    Delivery option
                  </h2>
                </div>

              </div>


              <div className="delivery-options">

                <button
                  type="button"
                  className={
                    deliveryMethod ===
                    "standard"
                      ? "delivery-option selected"
                      : "delivery-option"
                  }
                  onClick={() =>
                    setDeliveryMethod(
                      "standard"
                    )
                  }
                >

                  <div className="option-icon">
                    <Bike size={22} />
                  </div>

                  <div className="option-content">

                    <strong>
                      Standard delivery
                    </strong>

                    <span>
                      25–35 minutes
                    </span>

                  </div>

                  <div className="option-price">
                    $2.49
                  </div>

                  {deliveryMethod ===
                    "standard" && (
                    <CheckCircle2
                      className="selected-check"
                      size={20}
                    />
                  )}

                </button>


                <button
                  type="button"
                  className={
                    deliveryMethod ===
                    "priority"
                      ? "delivery-option selected"
                      : "delivery-option"
                  }
                  onClick={() =>
                    setDeliveryMethod(
                      "priority"
                    )
                  }
                >

                  <div className="option-icon">
                    <Clock3 size={22} />
                  </div>

                  <div className="option-content">

                    <strong>
                      Priority delivery
                    </strong>

                    <span>
                      15–20 minutes
                    </span>

                  </div>

                  <div className="option-price">
                    $4.99
                  </div>

                  {deliveryMethod ===
                    "priority" && (
                    <CheckCircle2
                      className="selected-check"
                      size={20}
                    />
                  )}

                </button>

              </div>

            </section>


            {/* PAYMENT */}

            <section className="checkout-card">

              <div className="checkout-section-title">

                <div className="checkout-title-icon">
                  <CreditCard size={20} />
                </div>

                <div>
                  <span>
                    STEP 03
                  </span>

                  <h2>
                    Payment method
                  </h2>
                </div>

              </div>


              <div className="payment-options">

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "cash"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "cash"
                    )
                  }
                >

                  <Banknote size={24} />

                  <div>

                    <strong>
                      Cash on delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>

                  </div>

                  {paymentMethod ===
                    "cash" && (
                    <CheckCircle2
                      size={20}
                    />
                  )}

                </button>


                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "card"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "card"
                    )
                  }
                >

                  <CreditCard size={24} />

                  <div>

                    <strong>
                      Card payment
                    </strong>

                    <span>
                      Secure online payment
                    </span>

                  </div>

                  {paymentMethod ===
                    "card" && (
                    <CheckCircle2
                      size={20}
                    />
                  )}

                </button>

              </div>


              {paymentMethod ===
                "card" && (

                <div className="card-demo-message">

                  <ShieldCheck
                    size={18}
                  />

                  <p>
                    Card payment is currently
                    a demo option. A payment
                    gateway can be integrated
                    later.
                  </p>

                </div>
              )}

            </section>

          </div>


          {/* =========================
              ORDER SUMMARY
          ========================== */}

          <aside className="checkout-summary">

            <span className="summary-label">
              YOUR ORDER
            </span>

            <h2>
              Order summary
            </h2>


            <div className="checkout-order-items">

              {cart.map((item) => (

                <div
                  className="checkout-order-item"
                  key={item.id}
                >

<div className="checkout-item-image">

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

                  <div className="checkout-item-info">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      Qty {item.quantity}
                    </span>

                  </div>

                  <strong>
                    $
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                </div>

              ))}

            </div>


            {/* APPLIED PROMO */}

            {appliedOffer && (

              <div className="checkout-promo">

                <BadgePercent
                  size={17}
                />

                <div>

                  <span>
                    PROMO APPLIED
                  </span>

                  <strong>
                    {appliedOffer.code}
                  </strong>

                </div>

                <CheckCircle2
                  size={18}
                />

              </div>

            )}


            <div className="checkout-costs">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ${subtotal.toFixed(2)}
                </strong>

              </div>


              {appliedOffer &&
                discountAmount > 0 && (

                <div className="checkout-discount-line">

                  <span>
                    Discount
                  </span>

                  <strong>
                    -$
                    {discountAmount.toFixed(
                      2
                    )}
                  </strong>

                </div>

              )}


              <div>

                <span>
                  Delivery
                </span>

                <strong>
                  {appliedOffer?.freeDelivery
                    ? "FREE"
                    : `$${deliveryFee.toFixed(
                        2
                      )}`}
                </strong>

              </div>


              <div>

                <span>
                  Service fee
                </span>

                <strong>
                  ${serviceFee.toFixed(2)}
                </strong>

              </div>

            </div>


            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                ${total.toFixed(2)}
              </strong>

            </div>


            {orderError && (

              <div className="checkout-order-error">
                {orderError}
              </div>

            )}


            <button
              className="place-order-button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                placingOrder
              }
            >

              {placingOrder
                ? "Placing order..."
                : "Place order"}

              {!placingOrder && (
                <ArrowRight
                  size={18}
                />
              )}

            </button>


            <div className="checkout-security">

              <ShieldCheck
                size={18}
              />

              <span>
                Pricing and promotions are
                securely verified before
                your order is created.
              </span>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Checkout;