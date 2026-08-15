import { useEffect, useState } from "react";
import {
  BadgePercent,
  Copy,
  Gift,
  Truck,
  Store,
  CalendarDays,
} from "lucide-react";

import "./Offers.css";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    async function fetchOffers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/offers"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch offers");
        }

        const data = await response.json();

        setOffers(data);
      } catch (error) {
        console.error(error);

        setError(
          "We couldn't load the latest BiteRush offers."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, []);

  async function copyOfferCode(code) {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  function formatDiscount(offer) {
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    }

    if (offer.discountType === "fixed") {
      return `$${offer.discountValue.toFixed(0)} OFF`;
    }

    if (offer.discountType === "free_delivery") {
      return "FREE DELIVERY";
    }

    return "SPECIAL OFFER";
  }

  function formatExpiry(date) {
    if (!date) {
      return "Limited time";
    }

    return new Date(date).toLocaleDateString();
  }

  return (
    <main className="offers-page">

      <section className="offers-hero">

        <div className="offers-hero-inner">

          <span className="offers-eyebrow">
            BITERUSH DEALS
          </span>

          <h1>
            More flavor.
            <span> Less spend.</span>
          </h1>

          <p>
            Unlock restaurant deals, delivery offers and
            BiteRush-exclusive discounts.
          </p>

        </div>

      </section>


      <section className="offers-content">

        <div className="offers-heading">

          <div>

            <span>
              ACTIVE OFFERS
            </span>

            <h2>
              Deals worth grabbing
            </h2>

          </div>

          {!loading && !error && (
            <p>
              {offers.length} active{" "}
              {offers.length === 1
                ? "offer"
                : "offers"}
            </p>
          )}

        </div>


        {loading && (
          <div className="offers-state">
            <Gift size={34} />

            <h2>Loading offers...</h2>

            <p>
              Finding the best BiteRush deals.
            </p>
          </div>
        )}


        {!loading && error && (
          <div className="offers-state">

            <h2>
              Offers unavailable
            </h2>

            <p>{error}</p>

          </div>
        )}


        {!loading &&
          !error &&
          offers.length === 0 && (

            <div className="offers-state">

              <Gift size={36} />

              <h2>
                No active offers
              </h2>

              <p>
                New deals will appear here soon.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          offers.length > 0 && (

            <div className="offers-grid">

              {offers.map((offer) => (

                <article
                  className="offer-card"
                  key={offer.id}
                >

                  <div className="offer-card-top">

                    <div className="offer-icon">

                      {offer.discountType ===
                      "free_delivery" ? (
                        <Truck size={24} />
                      ) : (
                        <BadgePercent size={24} />
                      )}

                    </div>


                    <span className="offer-discount">
                      {formatDiscount(offer)}
                    </span>

                  </div>


                  <div className="offer-body">

                    <h3>
                      {offer.title}
                    </h3>

                    <p>
                      {offer.description}
                    </p>


                    <div className="offer-details">

                      <div>
                        <Store size={15} />

                        <span>
                          {offer.restaurantName ||
                            "All restaurants"}
                        </span>
                      </div>


                      <div>
                        <CalendarDays size={15} />

                        <span>
                          Ends{" "}
                          {formatExpiry(
                            offer.expiresAt
                          )}
                        </span>
                      </div>

                    </div>


                    <div className="offer-minimum">

                      Minimum order:

                      <strong>
                        ${offer.minimumOrder.toFixed(2)}
                      </strong>

                    </div>

                  </div>


                  <div className="offer-code-box">

                    <div>

                      <span>
                        PROMO CODE
                      </span>

                      <strong>
                        {offer.code}
                      </strong>

                    </div>


                    <button
                      onClick={() =>
                        copyOfferCode(
                          offer.code
                        )
                      }
                    >
                      <Copy size={16} />

                      {copiedCode ===
                      offer.code
                        ? "Copied!"
                        : "Copy"}
                    </button>

                  </div>

                </article>

              ))}

            </div>
          )}

      </section>

    </main>
  );
}

export default Offers;