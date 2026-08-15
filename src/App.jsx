
import SignUp from "./pages/SignUp";
import Orders from "./pages/Orders";
import Restaurants from "./pages/Restaurants";
import { Routes, Route } from "react-router-dom";
import Offers from "./pages/Offers";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
  path="/signup"
  element={<SignUp />}
/>
        <Route path="/signin" element={<SignIn />} />
        <Route
  path="/offers"
  element={<Offers />}
/>
        <Route
  path="/restaurants"
  element={<Restaurants />}
/>
        <Route 
        path="/orders" 
        element={<Orders />} 
        />
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/restaurants/:id"
          element={<RestaurantDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

      </Routes>
    </>
  );
}

export default App;