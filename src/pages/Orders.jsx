import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PackageCheck,
  Clock3,
  MapPin,
  ShoppingBag,
  ReceiptText,
  ChefHat,
  Bike,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Orders.css";

function Orders() {
  const navigate = useNavigate();

  const {
    token,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
/* ========================================
   ORDER TRACKER
======================================== */

const orderSteps = [
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Order received",
    icon: PackageCheck,
  },
  {
    key: "preparing",
    label: "Preparing",
    description: "Kitchen is preparing it",
    icon: ChefHat,
  },
  {
    key: "out_for_delivery",
    label: "On the way",
    description: "Courier has your order",
    icon: Bike,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order completed",
    icon: CheckCircle2,
  },
];

function getStatusIndex(status) {
  const normalizedStatus =
    status?.toLowerCase().replaceAll(" ", "_");

  return orderSteps.findIndex(
    (step) => step.key === normalizedStatus
  );
}
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      navigate("/signin");
      return;
    }

    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch orders"
          );
        }

        setOrders(data);
      } catch (error) {
        console.error(
          "FETCH ORDERS ERROR:",
          error
        );

        setError(
          error.message ||
            "We couldn't load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [
    token,
    isAuthenticated,
    authLoading,
    navigate,
  ]);

  function formatDate(date) {
    return new Date(date).toLocaleString();
  }

  if (authLoading) {
    return (
      <main className="orders-page">
        <section className="orders-container">
          <div className="orders-state">
            <ShoppingBag size={34} />

            <h2>Checking your account...</h2>

            <p>
              Preparing your BiteRush order history.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">

      <section className="orders-container">

        <div className="orders-header">

          <span className="orders-label">
            ORDER HISTORY
          </span>

          <h1>Your orders</h1>

          <p>
            Track and review orders placed through
            your BiteRush account.
          </p>

        </div>


        {loading && (
          <div className="orders-state">

            <ShoppingBag size={34} />

            <h2>Loading orders...</h2>

            <p>
              Retrieving your latest orders.
            </p>

          </div>
        )}


        {!loading && error && (
          <div className="orders-state">

            <h2>
              Unable to load orders
            </h2>

            <p>
              {error}
            </p>

          </div>
        )}


        {!loading &&
          !error &&
          orders.length === 0 && (

            <div className="orders-state">

              <ShoppingBag size={38} />

              <h2>
                No orders yet
              </h2>

              <p>
                Orders placed with this account
                will appear here.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          orders.length > 0 && (

            <div className="orders-list">

              {orders.map((order) => (

                <article
                  className="order-card"
                  key={order.id}
                >

                  <div className="order-card-top">

                    <div>

                      <span className="order-number-label">
                        ORDER
                      </span>

                      <h2>
                        {order.orderNumber}
                      </h2>

                    </div>


                    <span
                      className={`order-status ${order.status}`}
                    >

                      <PackageCheck size={15} />

                      {order.status}

                    </span>

                  </div>


                  <div className="order-meta">

                    <div>

                      <Clock3 size={17} />

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>


                    <div>

                      <MapPin size={17} />

                      <span>
                        {order.city}
                      </span>

                    </div>

                  </div>

{/* ORDER PROGRESS TRACKER */}

<div className="order-tracker">

  {orderSteps.map(
    (step, index) => {

      const currentIndex =
        getStatusIndex(
          order.status
        );

      const completed =
        currentIndex > index;

      const active =
        currentIndex === index;

      const StepIcon =
        step.icon;

      return (
        <div
          className={`tracker-step ${
            completed
              ? "completed"
              : active
              ? "active"
              : ""
          }`}
          key={step.key}
        >

          <div className="tracker-icon">

            {completed ? (
              <CheckCircle2
                size={18}
              />
            ) : (
              <StepIcon
                size={17}
              />
            )}

          </div>


          <div className="tracker-copy">

            <strong>
              {step.label}
            </strong>

            <span>
              {step.description}
            </span>

          </div>


          {index <
            orderSteps.length -
              1 && (

            <div
              className={`tracker-line ${
                completed
                  ? "completed"
                  : ""
              }`}
            />

          )}

        </div>
      );
    }
  )}

</div>
                  <div className="order-content">

                    <div className="order-items">

                      <h3>
                        <ReceiptText size={17} />
                        Items
                      </h3>


                      {order.items.map((item) => (

                        <div
                          className="order-item-row"
                          key={item.id}
                        >

                          <div>

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


                    <div className="order-summary">

                      <span>
                        Total paid
                      </span>

                      <strong>
                        ${order.total.toFixed(2)}
                      </strong>

                      <small>
                        {order.paymentMethod ===
                        "cash"
                          ? "Cash on delivery"
                          : "Card payment"}
                      </small>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}

      </section>

    </main>
  );
}

export default Orders;