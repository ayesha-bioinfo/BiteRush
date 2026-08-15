import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock3,
  ChefHat,
  Bike,
  MapPin,
  ArrowRight,
  Home,
} from "lucide-react";

import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();

  const savedOrder = localStorage.getItem(
    "biterush-last-order"
  );

  const order = savedOrder
    ? JSON.parse(savedOrder)
    : null;

  if (!order) {
    return (
      <main className="no-order-page">
        <div>
          <h1>No recent order found</h1>

          <p>
            Place an order first to view its tracking
            information.
          </p>

          <button onClick={() => navigate("/")}>
            Browse restaurants
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="success-page">

      <div className="success-container">

        {/* SUCCESS HEADER */}

        <section className="success-header">

          <div className="success-icon">
            <Check size={35} strokeWidth={3} />
          </div>

          <span className="success-label">
            ORDER CONFIRMED
          </span>

          <h1>
            Your food is on the way!
          </h1>

          <p>
            Thanks for ordering with BiteRush.
            We've received your order and the restaurant
            is getting it ready.
          </p>

          <div className="order-number">
            Order
            <strong>#{order.id}</strong>
          </div>

        </section>


        {/* MAIN LAYOUT */}

        <div className="success-layout">

          {/* LEFT */}

          <section className="tracking-card">

            <div className="tracking-heading">

              <div>
                <span>LIVE STATUS</span>
                <h2>Track your order</h2>
              </div>

              <div className="estimated-time">
                <Clock3 size={18} />

                <div>
                  <span>Estimated arrival</span>
                  <strong>25–35 min</strong>
                </div>
              </div>

            </div>


            <div className="tracking-progress">

              {/* STEP 1 */}

              <div className="tracking-step completed">

                <div className="tracking-marker">
                  <Check size={17} />
                </div>

                <div className="tracking-step-content">

                  <strong>
                    Order confirmed
                  </strong>

                  <span>
                    We've received your order.
                  </span>

                </div>

              </div>


              {/* STEP 2 */}

              <div className="tracking-step active">

                <div className="tracking-marker">
                  <ChefHat size={18} />
                </div>

                <div className="tracking-step-content">

                  <strong>
                    Preparing your food
                  </strong>

                  <span>
                    The restaurant is preparing your order.
                  </span>

                </div>

              </div>


              {/* STEP 3 */}

              <div className="tracking-step">

                <div className="tracking-marker">
                  <Bike size={18} />
                </div>

                <div className="tracking-step-content">

                  <strong>
                    Rider assigned
                  </strong>

                  <span>
                    A delivery partner will collect your order.
                  </span>

                </div>

              </div>


              {/* STEP 4 */}

              <div className="tracking-step">

                <div className="tracking-marker">
                  <MapPin size={18} />
                </div>

                <div className="tracking-step-content">

                  <strong>
                    On the way
                  </strong>

                  <span>
                    Your order will be heading to you.
                  </span>

                </div>

              </div>

            </div>


            {/* DELIVERY DESTINATION */}

            <div className="delivery-destination">

              <MapPin size={20} />

              <div>

                <span>
                  DELIVERY TO
                </span>

                <strong>
                  {order.customer.address}
                </strong>

                <p>
                  {order.customer.city}
                </p>

              </div>

            </div>

          </section>


          {/* RIGHT */}

          <aside className="success-summary">

            <span className="summary-label">
              ORDER DETAILS
            </span>

            <h2>
              Your order
            </h2>


            <div className="success-items">

              {order.items.map((item) => (

                <div
                  className="success-item"
                  key={item.id}
                >

                  <div className="success-item-image">
                    {item.image}
                  </div>

                  <div className="success-item-info">

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


            <div className="success-costs">

              <div>
                <span>Subtotal</span>

                <strong>
                  ${order.subtotal.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Delivery</span>

                <strong>
                  ${order.deliveryFee.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Service fee</span>

                <strong>
                  ${order.serviceFee.toFixed(2)}
                </strong>
              </div>

            </div>


            <div className="success-total">

              <span>Total paid</span>

              <strong>
                ${order.total.toFixed(2)}
              </strong>

            </div>


            <div className="payment-detail">

              <span>Payment</span>

              <strong>
                {order.paymentMethod === "cash"
                  ? "Cash on delivery"
                  : "Card payment"}
              </strong>

            </div>

          </aside>

        </div>


        {/* ACTIONS */}

        <div className="success-actions">

          <button
            className="home-action"
            onClick={() => navigate("/")}
          >
            <Home size={18} />
            Back to home
          </button>


          <button
            className="orders-action"
            onClick={() => navigate("/orders")}
          >
            View my orders
            <ArrowRight size={18} />
          </button>

        </div>

      </div>

    </main>
  );
}

export default OrderSuccess;