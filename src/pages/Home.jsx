import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Bike,
  Clock3,
  Leaf,
  Search,
  Star,
  Tag,
  Trophy,
} from "lucide-react";

import heroFood from "../assets/food/hero-food.jpg";

import pizzaImage from "../assets/food/pizza.jpg";
import burgerImage from "../assets/food/burger.jpg";
import asianImage from "../assets/food/asian.jpg";
import chickenImage from "../assets/food/chicken.jpg";
import healthyImage from "../assets/food/salad.jpg";
import dessertImage from "../assets/food/desert.jpg";

import urbanGrillImage from "../assets/food/urban-grill.jpg";
import napoliHouseImage from "../assets/food/napoli-house.jpg";
import tokyoBowlImage from "../assets/food/tokyo-bowl.jpg";
import greenTableImage from "../assets/food/green-table.jpg";

import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/restaurants"
        );

        if (!response.ok) {
          throw new Error(
            "Unable to fetch restaurants"
          );
        }

        const data = await response.json();

        setRestaurants(data);
      } catch (error) {
        console.error(
          "HOME RESTAURANTS ERROR:",
          error
        );

        setError(
          "We couldn't load restaurants. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  function handleSearch() {
    const value = searchValue.trim();

    if (!value) {
      navigate("/restaurants");
      return;
    }

    navigate(
      `/restaurants?search=${encodeURIComponent(
        value
      )}`
    );
  }

  function searchCuisine(cuisine) {
    navigate(
      `/restaurants?search=${encodeURIComponent(
        cuisine
      )}`
    );
  }

  const cuisines = [
    {
      name: "Pizza",
      image: pizzaImage,
      search: "Italian",
    },
    {
      name: "Burgers",
      image: burgerImage,
      search: "Burger",
    },
    {
      name: "Asian",
      image: asianImage,
      search: "Asian",
    },
    {
      name: "Chicken",
      image: chickenImage,
      search: "Chicken",
    },
    {
      name: "Healthy",
      image: healthyImage,
      search: "Healthy",
    },
    {
      name: "Desserts",
      image: dessertImage,
      search: "Dessert",
    },
  ];

  const restaurantImages = {
    "Urban Grill": urbanGrillImage,
    "Napoli House": napoliHouseImage,
    "Tokyo Bowl": tokyoBowlImage,
    "Green Table": greenTableImage,
  };

  function getRestaurantImage(restaurant) {
    return (
      restaurantImages[restaurant.name] ||
      heroFood
    );
  }

  return (
    <main className="home-page">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="home-hero">

        <div className="hero-background">

          <img
            src={heroFood}
            alt="Selection of freshly prepared food"
          />

          <div className="hero-photo-overlay" />

        </div>


        <div className="hero-inner">

          <div className="hero-content">

            <span className="hero-badge">
              <Bike size={16} />
              Fast. Fresh. Delivered.
            </span>


            <h1>
              Your favorite
              <br />

              <span>
                food, delivered
                <br />
                fast.
              </span>
            </h1>


            <p className="hero-description">
              Discover top restaurants, explore
              delicious dishes and get your cravings
              delivered right to your door.
            </p>


            <div className="hero-search">

              <Search size={21} />

              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleSearch}
              >
                Find Food
                <ArrowRight size={18} />
              </button>

            </div>


            <div className="hero-stats">

              <div>
                <strong>
                  {restaurants.length || "—"}
                </strong>

                <span>
                  Restaurants
                </span>
              </div>


              <div>
                <strong>
                  30 min
                </strong>

                <span>
                  Avg. delivery
                </span>
              </div>


              <div>
                <strong>
                  4.8
                  <Star
                    size={16}
                    fill="currentColor"
                  />
                </strong>

                <span>
                  Top rated
                </span>
              </div>

            </div>

          </div>


          <div className="hero-photo-space">

            <div className="hero-rating-card">

              <div className="rating-icon">
                <Star
                  size={20}
                  fill="currentColor"
                />
              </div>

              <div>
                <strong>
                  4.8 average rating
                </strong>

                <span>
                  Loved by BiteRush customers
                </span>
              </div>

            </div>


            <div className="hero-delivery-card">

              <div className="delivery-card-image">
                <img
                  src={asianImage}
                  alt="Asian food"
                />
              </div>

              <div>
                <span>
                  POPULAR NOW
                </span>

                <strong>
                  Fresh meals, delivered fast
                </strong>

                <small>
                  Explore restaurants near you
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/restaurants")
                }
                aria-label="Explore restaurants"
              >
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          BENEFITS
      ====================================== */}

      <section className="benefit-wrapper">

        <div className="benefit-strip">

          <div className="benefit-item">

            <div className="benefit-icon">
              <Bike size={22} />
            </div>

            <div>
              <strong>
                Quick Delivery
              </strong>

              <span>
                Fast food at your door
              </span>
            </div>

          </div>


          <div className="benefit-item">

            <div className="benefit-icon">
              <Trophy size={22} />
            </div>

            <div>
              <strong>
                Top Rated
              </strong>

              <span>
                Quality restaurants
              </span>
            </div>

          </div>


          <div className="benefit-item">

            <div className="benefit-icon green">
              <Leaf size={22} />
            </div>

            <div>
              <strong>
                Fresh & Healthy
              </strong>

              <span>
                Something for everyone
              </span>
            </div>

          </div>


          <div className="benefit-item">

            <div className="benefit-icon purple">
              <Tag size={22} />
            </div>

            <div>
              <strong>
                Best Offers
              </strong>

              <span>
                Delicious deals
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          CUISINES
      ====================================== */}

      <section className="home-section cuisine-section">

        <div className="home-section-heading">

          <div>

            <span className="home-eyebrow">
              EXPLORE
            </span>

            <h2>
              What's on your mind?
            </h2>

            <p>
              Browse BiteRush by cuisine and find
              something you'll love.
            </p>

          </div>


          <button
            className="section-link"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            View all
            <ArrowRight size={18} />
          </button>

        </div>


        <div className="cuisine-grid">

          {cuisines.map((cuisine) => (

            <button
              className="cuisine-card"
              key={cuisine.name}
              onClick={() =>
                searchCuisine(cuisine.search)
              }
            >

              <div className="cuisine-image">

                <img
                  src={cuisine.image}
                  alt={cuisine.name}
                />

              </div>


              <div className="cuisine-card-bottom">

                <div>

                  <strong>
                    {cuisine.name}
                  </strong>

                  <span>
                    Explore dishes
                  </span>

                </div>


                <ArrowRight size={19} />

              </div>

            </button>

          ))}

        </div>

      </section>


      {/* =====================================
          FEATURED RESTAURANTS
      ====================================== */}

      <section className="home-section featured-section">

        <div className="home-section-heading">

          <div>

            <span className="home-eyebrow">
              POPULAR NEAR YOU
            </span>

            <h2>
              Featured restaurants
            </h2>

            <p>
              Discover popular places ready to
              prepare your next meal.
            </p>

          </div>


          <button
            className="section-link"
            onClick={() =>
              navigate("/restaurants")
            }
          >
            View all
            <ArrowRight size={18} />
          </button>

        </div>


        {loading && (

          <div className="home-state">

            <h3>
              Loading restaurants...
            </h3>

            <p>
              Finding something delicious for you.
            </p>

          </div>

        )}


        {!loading && error && (

          <div className="home-state">

            <h3>
              Unable to load restaurants
            </h3>

            <p>
              {error}
            </p>

          </div>

        )}


        {!loading &&
          !error &&
          restaurants.length > 0 && (

            <div className="featured-grid">

              {restaurants
                .slice(0, 4)
                .map((restaurant) => (

                  <article
                    className="featured-card"
                    key={restaurant.id}
                    onClick={() =>
                      navigate(
                        `/restaurants/${restaurant.id}`
                      )
                    }
                  >

                    <div className="featured-image">

                      <img
                        src={getRestaurantImage(
                          restaurant
                        )}
                        alt={restaurant.name}
                      />


                      {restaurant.isOpen && (
                        <span className="featured-open">
                          OPEN
                        </span>
                      )}


                      <span className="featured-rating">

                        <Star
                          size={15}
                          fill="currentColor"
                        />

                        {restaurant.rating}

                      </span>

                    </div>


                    <div className="featured-content">

                      <span className="featured-cuisine">
                        {restaurant.cuisine}
                      </span>


                      <h3>
                        {restaurant.name}
                      </h3>


                      <div className="featured-meta">

                        <span>
                          <Clock3 size={17} />
                          {restaurant.deliveryTime}
                        </span>

                        <span>
                          <Bike size={17} />
                          {restaurant.deliveryFee}
                        </span>

                      </div>


                      <button
                        type="button"
                        className="featured-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          navigate(
                            `/restaurants/${restaurant.id}`
                          );
                        }}
                      >
                        View menu
                        <ArrowRight size={17} />
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

export default Home;