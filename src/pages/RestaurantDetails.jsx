import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Star,
  Clock3,
  Bike,
  Plus,
  Check,
  BadgePercent,
} from "lucide-react";

import { useCart } from "../context/CartContext";

/* RESTAURANT PHOTOS */

import urbanGrillImage from "../assets/food/urban-grill.jpg";
import napoliHouseImage from "../assets/food/napoli-house.jpg";
import tokyoBowlImage from "../assets/food/tokyo-bowl.jpg";
import greenTableImage from "../assets/food/green-table.jpg";

/* GENERAL FOOD PHOTOS */

import burgerImage from "../assets/food/burger.jpg";
import pizzaImage from "../assets/food/pizza.jpg";
import asianImage from "../assets/food/asian.jpg";
import chickenImage from "../assets/food/chicken.jpg";
import saladImage from "../assets/food/salad.jpg";
import dessertImage from "../assets/food/desert.jpg";

/* URBAN GRILL MENU PHOTOS */

import smashBurgerImage from "../assets/food/menu/smash-burger.jpg";
import loadedFriesImage from "../assets/food/menu/loaded-fries.jpg";
import chickenBurgerImage from "../assets/food/menu/chicken-burger.jpg";
import chocolateShakeImage from "../assets/food/menu/chocolate-shake.jpg";

import "./RestaurantDetails.css";

function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    restaurantConflict,
    pendingItem,
    confirmRestaurantChange,
    cancelRestaurantChange,
  } = useCart();

  const [restaurant, setRestaurant] =
    useState(null);

  const [menu, setMenu] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addedItem, setAddedItem] =
    useState(null);

  useEffect(() => {
    async function fetchRestaurantData() {
      try {
        setLoading(true);
        setError("");

        const [
          restaurantResponse,
          menuResponse,
        ] = await Promise.all([
          fetch(
            `http://localhost:5000/api/restaurants/${id}`
          ),

          fetch(
            `http://localhost:5000/api/restaurants/${id}/menu`
          ),
        ]);

        if (!restaurantResponse.ok) {
          throw new Error(
            "Restaurant not found"
          );
        }

        if (!menuResponse.ok) {
          throw new Error(
            "Unable to load menu"
          );
        }

        const restaurantData =
          await restaurantResponse.json();

        const menuData =
          await menuResponse.json();

        setRestaurant(
          restaurantData
        );

        setMenu(menuData);
      } catch (error) {
        console.error(
          "RESTAURANT DETAILS ERROR:",
          error
        );

        setError(
          "We couldn't load this restaurant. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurantData();
  }, [id]);


  /* ========================================
     IMAGE HELPERS
  ======================================== */

  function getRestaurantImage(name) {
    const restaurantImages = {
      "Urban Grill": urbanGrillImage,
      "Napoli House": napoliHouseImage,
      "Tokyo Bowl": tokyoBowlImage,
      "Green Table": greenTableImage,
    };

    return (
      restaurantImages[name] ||
      urbanGrillImage
    );
  }


  function getMenuImage(item) {
    const specificImages = {
      "Classic Smash Burger":
        smashBurgerImage,

      "Loaded Fries":
        loadedFriesImage,

      "Crispy Chicken Stack":
        chickenBurgerImage,

      "Chocolate Shake":
        chocolateShakeImage,
    };

    if (specificImages[item.name]) {
      return specificImages[item.name];
    }

    const category =
      item.category
        ?.toLowerCase() || "";

    const name =
      item.name
        ?.toLowerCase() || "";

    if (
      category.includes("pizza") ||
      name.includes("pizza")
    ) {
      return pizzaImage;
    }

    if (
      category.includes("burger") ||
      name.includes("burger")
    ) {
      return burgerImage;
    }

    if (
      category.includes("chicken") ||
      name.includes("chicken")
    ) {
      return chickenImage;
    }

    if (
      category.includes("salad") ||
      category.includes("healthy") ||
      name.includes("salad")
    ) {
      return saladImage;
    }

    if (
      category.includes("dessert") ||
      category.includes("drink") ||
      name.includes("shake")
    ) {
      return dessertImage;
    }

    return asianImage;
  }


  /* ========================================
     ADD TO CART
  ======================================== */
function handleAddToCart(item) {
  const itemWithPhoto = {
    ...item,
    displayImage: getMenuImage(item),
  };

  const result =
    addToCart(itemWithPhoto);

    /*
      If another restaurant is already
      in the cart, the CartContext will
      show the conflict modal instead.
    */

    if (result?.conflict) {
      return;
    }

    setAddedItem(item.id);

    setTimeout(() => {
      setAddedItem(null);
    }, 1000);
  }


  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <main className="restaurant-state-page">

        <div>

          <h2>
            Loading restaurant...
          </h2>

          <p>
            We're getting the menu ready.
          </p>

        </div>

      </main>
    );
  }


  /* ========================================
     ERROR
  ======================================== */

  if (error || !restaurant) {
    return (
      <main className="restaurant-state-page">

        <div>

          <h2>
            Restaurant unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                "/restaurants"
              )
            }
          >
            Back to restaurants
          </button>

        </div>

      </main>
    );
  }


  return (
    <main className="restaurant-details-page">

      <div className="restaurant-details-container">

        {/* =================================
            BACK
        ================================== */}

        <button
          className="restaurant-back"
          onClick={() =>
            navigate(
              "/restaurants"
            )
          }
        >
          <ArrowLeft size={19} />
          Back to restaurants
        </button>


        {/* =================================
            HERO
        ================================== */}

        <section className="restaurant-hero">

          {/* LEFT */}

          <div className="restaurant-hero-info">

            <div className="restaurant-status-row">

              {restaurant.isOpen ? (
                <span className="restaurant-open">
                  Open now
                </span>
              ) : (
                <span className="restaurant-closed">
                  Closed
                </span>
              )}

              <span className="restaurant-hours">
                <Clock3 size={17} />
                Freshly prepared to order
              </span>

            </div>


            <h1>
              {restaurant.name}
            </h1>


            <p className="restaurant-cuisine">
              {restaurant.cuisine}
            </p>


            <div className="restaurant-rating-line">

              <Star
                size={20}
                fill="currentColor"
              />

              <strong>
                {restaurant.rating}
              </strong>

              <span>
                Customer rating
              </span>

            </div>


            <div className="restaurant-stats">

              <div>

                <Clock3 size={21} />

                <div>
                  <strong>
                    {restaurant.deliveryTime}
                  </strong>

                  <span>
                    Delivery time
                  </span>
                </div>

              </div>


              <div>

                <Bike size={21} />

                <div>
                  <strong>
                    {restaurant.deliveryFee}
                  </strong>

                  <span>
                    Delivery fee
                  </span>
                </div>

              </div>


              <div>

                <BadgePercent
                  size={21}
                />

                <div>
                  <strong>
                    Offers available
                  </strong>

                  <span>
                    See active deals
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* RIGHT PHOTO */}

          <div className="restaurant-hero-image">

            <img
              src={getRestaurantImage(
                restaurant.name
              )}
              alt={`${restaurant.name} food`}
            />

            <div className="restaurant-photo-shade" />

          </div>

        </section>


        {/* =================================
            MENU
        ================================== */}

        <section className="menu-section">

          <div className="menu-heading">

            <span>
              CUSTOMER FAVORITES
            </span>

            <h2>
              Popular dishes
            </h2>

            <p>
              Freshly prepared favorites from{" "}
              {restaurant.name}.
            </p>

          </div>


          {menu.length === 0 ? (

            <div className="menu-empty">

              <h3>
                No menu items available
              </h3>

              <p>
                This restaurant hasn't
                added its menu yet.
              </p>

            </div>

          ) : (

            <div className="menu-grid">

              {menu.map((item) => (

                <article
                  className="menu-card"
                  key={item.id}
                >

                  {/* IMAGE */}

                  <div className="menu-card-image">

                    <img
                      src={getMenuImage(item)}
                      alt={item.name}
                    />

                    {item.popular && (
                      <div className="popular-badge">
                        POPULAR
                      </div>
                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="menu-card-content">

                    <span className="menu-category">
                      {item.category}
                    </span>


                    <h3>
                      {item.name}
                    </h3>


                    <p>
                      {item.description}
                    </p>


                    <div className="menu-card-bottom">

                      <strong>
                        $
                        {item.price.toFixed(
                          2
                        )}
                      </strong>


                      <button
                        className={
                          addedItem ===
                          item.id
                            ? "add-food-button added"
                            : "add-food-button"
                        }
                        onClick={() =>
                          handleAddToCart(
                            item
                          )
                        }
                      >

                        {addedItem ===
                        item.id ? (
                          <>
                            <Check
                              size={18}
                            />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus
                              size={18}
                            />
                            Add
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>


      {/* =================================
          DIFFERENT RESTAURANT MODAL
      ================================== */}

      {restaurantConflict &&
        pendingItem && (

        <div className="cart-conflict-overlay">

          <div className="cart-conflict-modal">

            <span className="conflict-label">
              DIFFERENT RESTAURANT
            </span>

            <h2>
              Start a new order?
            </h2>

            <p>
              Your cart already contains items
              from another restaurant. Starting
              this order will clear your current
              cart.
            </p>


            <div className="conflict-item">

              <img
                src={getMenuImage(
                  pendingItem
                )}
                alt={
                  pendingItem.name
                }
              />

              <div>

                <strong>
                  {pendingItem.name}
                </strong>

                <small>
                  $
                  {pendingItem.price.toFixed(
                    2
                  )}
                </small>

              </div>

            </div>


            <div className="conflict-actions">

              <button
                className="conflict-cancel"
                onClick={
                  cancelRestaurantChange
                }
              >
                Keep current cart
              </button>


              <button
                className="conflict-confirm"
                onClick={
                  confirmRestaurantChange
                }
              >
                Start new order
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default RestaurantDetails;