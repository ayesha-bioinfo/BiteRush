import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Search,
  Star,
  Clock3,
  Bike,
  ArrowRight,
  SlidersHorizontal,
  Store,
} from "lucide-react";

import urbanGrillImage from "../assets/food/urban-grill.jpg";
import napoliHouseImage from "../assets/food/napoli-house.jpg";
import tokyoBowlImage from "../assets/food/tokyo-bowl.jpg";
import greenTableImage from "../assets/food/green-table.jpg";
import heroFood from "../assets/food/hero-food.jpg";

import "./Restaurants.css";

function Restaurants() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const initialSearch =
    searchParams.get("search") || "";

  const [
    restaurants,
    setRestaurants,
  ] = useState([]);

  const [
    restaurantMenus,
    setRestaurantMenus,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState(initialSearch);

  const [filter, setFilter] =
    useState("All");


  /* ========================================
     LOAD RESTAURANTS + MENUS
  ======================================== */

  useEffect(() => {
    async function fetchRestaurantsAndMenus() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/restaurants"
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load restaurants"
          );
        }

        const restaurantData =
          await response.json();

        setRestaurants(
          restaurantData
        );


        /*
          Load menu for every restaurant.
          This allows searches like:
          Chicken
          Dessert
          Sushi
          Mochi
          Fries
          Shake
        */

        const menuEntries =
          await Promise.all(
            restaurantData.map(
              async (restaurant) => {
                try {
                  const menuResponse =
                    await fetch(
                      `http://localhost:5000/api/restaurants/${restaurant.id}/menu`
                    );

                  if (!menuResponse.ok) {
                    return [
                      restaurant.id,
                      [],
                    ];
                  }

                  const menu =
                    await menuResponse.json();

                  return [
                    restaurant.id,
                    menu,
                  ];
                } catch (error) {
                  console.error(
                    `MENU LOAD ERROR FOR RESTAURANT ${restaurant.id}:`,
                    error
                  );

                  return [
                    restaurant.id,
                    [],
                  ];
                }
              }
            )
          );

        const menuMap =
          Object.fromEntries(
            menuEntries
          );

        setRestaurantMenus(
          menuMap
        );

      } catch (error) {
        console.error(
          "RESTAURANTS ERROR:",
          error
        );

        setError(
          "We couldn't load restaurants. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurantsAndMenus();
  }, []);


  /* ========================================
     SYNC URL SEARCH
  ======================================== */

  useEffect(() => {
    const querySearch =
      searchParams.get("search") || "";

    setSearch(querySearch);
  }, [searchParams]);


  /* ========================================
     FILTERS
  ======================================== */

  const categories = [
    "All",
    "American",
    "Italian",
    "Asian",
    "Healthy",
  ];


  const filteredRestaurants =
    useMemo(() => {

      return restaurants.filter(
        (restaurant) => {

          const searchValue =
            search
              .toLowerCase()
              .trim();


          /* RESTAURANT TEXT */

          const restaurantText = `
            ${restaurant.name || ""}
            ${restaurant.cuisine || ""}
          `.toLowerCase();


          /* MENU TEXT */

          const menu =
            restaurantMenus[
              restaurant.id
            ] || [];

          const menuText =
            menu
              .map(
                (item) => `
                  ${item.name || ""}
                  ${item.category || ""}
                  ${item.description || ""}
                `
              )
              .join(" ")
              .toLowerCase();


          /* SEARCH MATCH */

          const matchesSearch =
            !searchValue ||
            restaurantText.includes(
              searchValue
            ) ||
            menuText.includes(
              searchValue
            );


          /* CUISINE FILTER */

          const matchesFilter =
            filter === "All" ||
            restaurant.cuisine
              .toLowerCase()
              .includes(
                filter.toLowerCase()
              );


          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      restaurants,
      restaurantMenus,
      search,
      filter,
    ]);


  function handleSearchChange(event) {
    const value =
      event.target.value;

    setSearch(value);

    if (value.trim()) {
      setSearchParams({
        search: value,
      });
    } else {
      setSearchParams({});
    }
  }


  function clearFilters() {
    setSearch("");
    setFilter("All");
    setSearchParams({});
  }


  /* ========================================
     RESTAURANT IMAGES
  ======================================== */

  const restaurantImages = {
    "Urban Grill":
      urbanGrillImage,

    "Napoli House":
      napoliHouseImage,

    "Tokyo Bowl":
      tokyoBowlImage,

    "Green Table":
      greenTableImage,
  };


  function getRestaurantImage(
    restaurant
  ) {
    return (
      restaurantImages[
        restaurant.name
      ] || heroFood
    );
  }


  return (
    <main className="restaurants-page">

      {/* HERO */}

      <section className="restaurants-hero">

        <div className="restaurants-hero-inner">

          <div className="restaurants-hero-copy">

            <span className="restaurants-eyebrow">
              BITERUSH DISCOVERY
            </span>

            <h1>
              Find your next
              <span> favorite.</span>
            </h1>

            <p>
              Browse top-rated restaurants,
              explore different cuisines and
              find exactly what you're craving.
            </p>

          </div>


          <div className="restaurants-hero-stat">

            <div className="restaurant-count-icon">
              <Store size={25} />
            </div>

            <div>

              <strong>
                {restaurants.length}
              </strong>

              <span>
                Restaurants available
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* DIRECTORY */}

      <section className="restaurants-directory">

        <div className="restaurants-toolbar">

          <div className="restaurant-search-box">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search restaurant, cuisine or dish..."
              value={search}
              onChange={
                handleSearchChange
              }
            />

          </div>


          <div className="filter-title">

            <SlidersHorizontal
              size={18}
            />

            <span>
              Filter cuisine
            </span>

          </div>

        </div>


        <div className="restaurant-filters">

          {categories.map(
            (category) => (

              <button
                key={category}
                className={
                  filter === category
                    ? "restaurant-filter active"
                    : "restaurant-filter"
                }
                onClick={() =>
                  setFilter(category)
                }
              >
                {category}
              </button>

            )
          )}

        </div>


        {!loading &&
          !error && (

          <div className="restaurant-results-heading">

            <div>

              <span>
                RESTAURANTS
              </span>

              <h2>
                {search
                  ? `Results for "${search}"`
                  : filter === "All"
                  ? "Explore all"
                  : `${filter} restaurants`}
              </h2>

            </div>


            <p>
              {filteredRestaurants.length}{" "}
              {filteredRestaurants.length ===
              1
                ? "restaurant"
                : "restaurants"}
            </p>

          </div>

        )}


        {loading && (

          <div className="restaurants-directory-state">

            <Store size={38} />

            <h2>
              Finding restaurants...
            </h2>

            <p>
              Loading restaurants and menus.
            </p>

          </div>

        )}


        {!loading &&
          error && (

          <div className="restaurants-directory-state">

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

          </div>

        )}


        {!loading &&
          !error &&
          filteredRestaurants.length ===
            0 && (

          <div className="restaurants-directory-state">

            <Search size={38} />

            <h2>
              No restaurants found
            </h2>

            <p>
              Try another restaurant,
              cuisine or dish name.
            </p>

            <button
              onClick={clearFilters}
            >
              Clear filters
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          filteredRestaurants.length >
            0 && (

          <div className="directory-grid">

            {filteredRestaurants.map(
              (restaurant) => (

                <article
                  className="directory-card"
                  key={restaurant.id}
                  onClick={() =>
                    navigate(
                      `/restaurants/${restaurant.id}`
                    )
                  }
                >

                  <div className="directory-card-visual">

                    <img
                      className="directory-food"
                      src={getRestaurantImage(
                        restaurant
                      )}
                      alt={
                        restaurant.name
                      }
                    />

                    <div className="directory-image-overlay" />


                    {restaurant.isOpen ? (
                      <span className="directory-open">
                        OPEN
                      </span>
                    ) : (
                      <span className="directory-closed">
                        CLOSED
                      </span>
                    )}


                    <div className="directory-rating">

                      <Star
                        size={16}
                        fill="currentColor"
                      />

                      {restaurant.rating}

                    </div>

                  </div>


                  <div className="directory-card-body">

                    <span className="directory-cuisine">
                      {restaurant.cuisine}
                    </span>


                    <h3>
                      {restaurant.name}
                    </h3>


                    <div className="directory-meta">

                      <span>
                        <Clock3 size={18} />

                        {
                          restaurant.deliveryTime
                        }
                      </span>


                      <span>
                        <Bike size={18} />

                        {
                          restaurant.deliveryFee
                        }
                      </span>

                    </div>


                    <button
                      className="directory-view-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        navigate(
                          `/restaurants/${restaurant.id}`
                        );
                      }}
                    >
                      View menu

                      <ArrowRight
                        size={18}
                      />
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default Restaurants;