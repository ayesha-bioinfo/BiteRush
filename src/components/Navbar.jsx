import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  User,
  UserPlus,
  Menu,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const { cartCount } = useCart();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [accountOpen, setAccountOpen] =
    useState(false);

  function handleLogout() {
    logout();

    setAccountOpen(false);

    navigate("/");
  }

  return (
    <nav className="navbar">

      {/* LOGO */}

      <Link
        to="/"
        className="navbar-logo"
      >
        <span className="logo-mark">
          B
        </span>

        <span>
          BiteRush
        </span>
      </Link>


      {/* NAVIGATION */}

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/restaurants">
          Restaurants
        </Link>

        <Link to="/offers">
          Offers
        </Link>

        <Link to="/orders">
          Orders
        </Link>

      </div>


      {/* ACTIONS */}

      <div className="navbar-actions">

        {/* CART */}

        <button
          className="icon-btn cart-navbar-button"
          onClick={() =>
            navigate("/cart")
          }
          aria-label="Open cart"
        >
          <ShoppingBag size={21} />

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </button>


        {/* LOGGED OUT */}

        {!isAuthenticated && (
          <>
            <button
              className="navbar-signin-btn"
              onClick={() =>
                navigate("/signin")
              }
            >
              <User size={18} />

              Sign In
            </button>


            <button
              className="navbar-signup-btn"
              onClick={() =>
                navigate("/signup")
              }
            >
              <UserPlus size={18} />

              Sign Up
            </button>
          </>
        )}


        {/* LOGGED IN */}

        {isAuthenticated && user && (

          <div className="account-menu">

            <button
              className="account-button"
              onClick={() =>
                setAccountOpen(
                  (current) => !current
                )
              }
            >

              <div className="account-avatar">

                {user.fullName
                  ?.charAt(0)
                  .toUpperCase()}

              </div>


              <div className="account-info">

                <span>
                  Welcome
                </span>

                <strong>
                  {user.fullName}
                </strong>

              </div>


              <ChevronDown
                size={17}
                className={
                  accountOpen
                    ? "account-chevron open"
                    : "account-chevron"
                }
              />

            </button>


            {accountOpen && (

              <div className="account-dropdown">

                <div className="account-dropdown-header">

                  <div className="dropdown-avatar">

                    {user.fullName
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>


                  <div>

                    <strong>
                      {user.fullName}
                    </strong>

                    <span>
                      {user.email}
                    </span>

                  </div>

                </div>


                <div className="dropdown-divider" />


                <button
                  onClick={() => {
                    setAccountOpen(false);

                    navigate("/orders");
                  }}
                >
                  <Package size={18} />

                  My Orders
                </button>


                <button
                  className="logout-button"
                  onClick={
                    handleLogout
                  }
                >
                  <LogOut size={18} />

                  Log out
                </button>

              </div>

            )}

          </div>

        )}


        {/* MOBILE BUTTON */}

        <button
          className="mobile-menu"
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>

      </div>

    </nav>
  );
}

export default Navbar;