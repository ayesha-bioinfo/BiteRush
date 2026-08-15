require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("Connected to PostgreSQL successfully");
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error.message);
  });
/* =========================================
   JWT AUTH MIDDLEWARE
========================================= */

function requireAuth(req, res, next) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token.",
    });
  }
}
app.get("/", (req, res) => {
  res.send("BiteRush backend is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "BiteRush API is working",
  });
});

/* =========================================
   GET ALL RESTAURANTS
========================================= */

app.get("/api/restaurants", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        cuisine,
        rating,
        delivery_time,
        delivery_fee,
        image,
        is_open
      FROM restaurants
      ORDER BY id
    `);

    const restaurants = result.rows.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: Number(restaurant.rating),
      deliveryTime: restaurant.delivery_time,
      deliveryFee: `$${Number(restaurant.delivery_fee).toFixed(2)}`,
      image: restaurant.image,
      isOpen: restaurant.is_open,
    }));

    res.json(restaurants);
  } catch (error) {
    console.error("GET restaurants error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurants",
    });
  }
});

/* =========================================
   GET ONE RESTAURANT
========================================= */

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        cuisine,
        rating,
        delivery_time,
        delivery_fee,
        image,
        is_open
      FROM restaurants
      WHERE id = $1
      `,
      [restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const restaurant = result.rows[0];

    res.json({
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: Number(restaurant.rating),
      deliveryTime: restaurant.delivery_time,
      deliveryFee: `$${Number(restaurant.delivery_fee).toFixed(2)}`,
      image: restaurant.image,
      isOpen: restaurant.is_open,
    });
  } catch (error) {
    console.error("GET restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant",
    });
  }
});

/* =========================================
   GET MENU FOR ONE RESTAURANT
========================================= */

app.get("/api/restaurants/:id/menu", async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        id,
        restaurant_id,
        name,
        category,
        description,
        price,
        image,
        popular,
        available
      FROM menu_items
      WHERE restaurant_id = $1
      AND available = TRUE
      ORDER BY id
      `,
      [restaurantId]
    );

    const menu = result.rows.map((item) => ({
      id: item.id,
      restaurantId: item.restaurant_id,
      name: item.name,
      category: item.category,
      description: item.description,
      price: Number(item.price),
      image: item.image,
      popular: item.popular,
      available: item.available,
    }));

    res.json(menu);
  } catch (error) {
    console.error("GET menu error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch menu",
    });
  }
});
/* =========================================
   CREATE ORDER
========================================= */
/* =========================================
   CREATE ORDER
   Secure server-side price calculation
========================================= */

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      deliveryInstructions,
      deliveryMethod,
      paymentMethod,
      items,
      promoCode,
    } = req.body;

    /* =====================================
       1. BASIC VALIDATION
    ===================================== */

    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !deliveryAddress?.trim() ||
      !city?.trim() ||
      !deliveryMethod ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required order information",
      });
    }

    if (
      deliveryMethod !== "standard" &&
      deliveryMethod !== "priority"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery method",
      });
    }

    if (
      paymentMethod !== "cash" &&
      paymentMethod !== "card"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /* =====================================
       2. VALIDATE ITEM IDS + QUANTITIES
    ===================================== */

    for (const item of items) {
      const quantity = Number(item.quantity);
      const menuItemId = Number(item.id);

      if (
        !Number.isInteger(menuItemId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item",
        });
      }
    }

    const menuItemIds = [
      ...new Set(
        items.map((item) => Number(item.id))
      ),
    ];

    /* =====================================
       3. GET REAL MENU DATA FROM DATABASE
    ===================================== */

    const menuResult = await client.query(
      `
      SELECT
        id,
        restaurant_id,
        name,
        price
      FROM menu_items
      WHERE id = ANY($1::int[])
      `,
      [menuItemIds]
    );

    if (
      menuResult.rows.length !==
      menuItemIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more menu items are no longer available.",
      });
    }

    const menuMap = new Map(
      menuResult.rows.map((item) => [
        Number(item.id),
        item,
      ])
    );

    /* =====================================
       4. ENFORCE ONE RESTAURANT
    ===================================== */

    const restaurantIds = new Set(
      menuResult.rows.map((item) =>
        Number(item.restaurant_id)
      )
    );

    if (restaurantIds.size !== 1) {
      return res.status(400).json({
        success: false,
        message:
          "All items in an order must belong to the same restaurant.",
      });
    }

    const restaurantId =
      Number(menuResult.rows[0].restaurant_id);

    /* =====================================
       5. CALCULATE REAL SUBTOTAL
    ===================================== */

    let subtotal = 0;

    const verifiedItems = items.map(
      (cartItem) => {
        const databaseItem = menuMap.get(
          Number(cartItem.id)
        );

        const quantity =
          Number(cartItem.quantity);

        const unitPrice =
          Number(databaseItem.price);

        subtotal +=
          unitPrice * quantity;

        return {
          id: Number(databaseItem.id),
          name: databaseItem.name,
          quantity,
          price: unitPrice,
        };
      }
    );

    subtotal =
      Math.round(subtotal * 100) / 100;

    /* =====================================
       6. DELIVERY FEE
    ===================================== */

    let deliveryFee =
      deliveryMethod === "priority"
        ? 4.99
        : 2.49;

    /* =====================================
       7. SERVICE FEE
    ===================================== */

    let serviceFee =
      Math.round(
        subtotal * 0.05 * 100
      ) / 100;

    /* =====================================
       8. VALIDATE PROMO AGAIN
    ===================================== */

    let discountAmount = 0;

    let appliedPromoCode = null;

    if (
      promoCode &&
      promoCode.trim() !== ""
    ) {
      const offerResult =
        await client.query(
          `
          SELECT
            id,
            code,
            discount_type,
            discount_value,
            restaurant_id,
            minimum_order
          FROM offers

          WHERE UPPER(code) = UPPER($1)

          AND active = TRUE

          AND (
            expires_at IS NULL
            OR expires_at > CURRENT_TIMESTAMP
          )

          LIMIT 1
          `,
          [promoCode.trim()]
        );

      if (offerResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "The applied promo code is invalid or has expired.",
        });
      }

      const offer =
        offerResult.rows[0];

      const minimumOrder =
        Number(offer.minimum_order);

      const discountValue =
        Number(offer.discount_value);

      /* Minimum order */

      if (subtotal < minimumOrder) {
        return res.status(400).json({
          success: false,

          message:
            `This promo requires a minimum order of $${minimumOrder.toFixed(
              2
            )}.`,
        });
      }

      /* Restaurant restriction */

      if (
        offer.restaurant_id !== null &&
        Number(offer.restaurant_id) !==
          restaurantId
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This promo is not valid for this restaurant.",
        });
      }

      /* Percentage discount */

      if (
        offer.discount_type ===
        "percentage"
      ) {
        discountAmount =
          subtotal *
          (discountValue / 100);
      }

      /* Fixed discount */

      else if (
        offer.discount_type === "fixed"
      ) {
        discountAmount = Math.min(
          discountValue,
          subtotal
        );
      }

      /* Free delivery */

      else if (
        offer.discount_type ===
        "free_delivery"
      ) {
        deliveryFee = 0;
      }

      /* Invalid offer type */

      else {
        return res.status(400).json({
          success: false,
          message:
            "Unsupported promotion type.",
        });
      }

      discountAmount =
        Math.round(
          discountAmount * 100
        ) / 100;

      appliedPromoCode =
        offer.code;
    }

    /* =====================================
       9. CALCULATE FINAL TOTAL
    ===================================== */

    const total =
      Math.round(
        (
          subtotal -
          discountAmount +
          deliveryFee +
          serviceFee
        ) * 100
      ) / 100;

    /* =====================================
       10. START TRANSACTION
    ===================================== */

    await client.query("BEGIN");

    const orderNumber =
      "BR-" +
      Date.now()
        .toString()
        .slice(-8);

    /* =====================================
       11. CREATE ORDER
    ===================================== */

    const orderResult =
      await client.query(
        `
        INSERT INTO orders (
          order_number,
          customer_name,
          customer_phone,
          delivery_address,
          city,
          delivery_instructions,
          delivery_method,
          payment_method,
          subtotal,
          delivery_fee,
          service_fee,
          total,
          status
        )

        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, 'confirmed'
        )

        RETURNING *
        `,
        [
          orderNumber,

          customerName.trim(),
          customerPhone.trim(),
          deliveryAddress.trim(),
          city.trim(),

          deliveryInstructions?.trim() ||
            "",

          deliveryMethod,
          paymentMethod,

          subtotal,
          deliveryFee,
          serviceFee,
          total,
        ]
      );

    const order =
      orderResult.rows[0];

    /* =====================================
       12. SAVE VERIFIED ORDER ITEMS
    ===================================== */

    for (
      const item of verifiedItems
    ) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          item_name,
          quantity,
          unit_price
        )

        VALUES (
          $1, $2, $3, $4, $5
        )
        `,
        [
          order.id,
          item.id,
          item.name,
          item.quantity,
          item.price,
        ]
      );
    }

    /* =====================================
       13. COMMIT
    ===================================== */

    await client.query("COMMIT");

    /* =====================================
       14. SEND VERIFIED ORDER TO REACT
    ===================================== */

    res.status(201).json({
      success: true,

      message:
        "Order placed successfully",

      order: {
        id: order.id,

        orderNumber:
          order.order_number,

        status:
          order.status,

        restaurantId,

        subtotal,

        discountAmount,

        promoCode:
          appliedPromoCode,

        deliveryFee,

        serviceFee,

        total,

        createdAt:
          order.created_at,
      },
    });
  } catch (error) {
    /*
      ROLLBACK is safe even if BEGIN
      was not reached.
    */

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to place order",
    });
  } finally {
    client.release();
  }
});
/* =========================================
   GET ALL ORDERS
========================================= */

app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.city,
        o.delivery_method,
        o.payment_method,
        o.total,
        o.status,
        o.created_at,

        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menuItemId', oi.menu_item_id,
              'name', oi.item_name,
              'quantity', oi.quantity,
              'price', oi.unit_price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM orders o

      LEFT JOIN order_items oi
        ON o.id = oi.order_id

      GROUP BY o.id

      ORDER BY o.created_at DESC
    `);

    const orders = result.rows.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      address: order.delivery_address,
      city: order.city,
      deliveryMethod: order.delivery_method,
      paymentMethod: order.payment_method,
      total: Number(order.total),
      status: order.status,
      createdAt: order.created_at,

      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
});
/* =========================================
   GET ACTIVE OFFERS
========================================= */

app.get("/api/offers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.title,
        o.description,
        o.code,
        o.discount_type,
        o.discount_value,
        o.restaurant_id,
        o.minimum_order,
        o.active,
        o.expires_at,

        r.name AS restaurant_name

      FROM offers o

      LEFT JOIN restaurants r
        ON o.restaurant_id = r.id

      WHERE o.active = TRUE

      AND (
        o.expires_at IS NULL
        OR o.expires_at > CURRENT_TIMESTAMP
      )

      ORDER BY o.id
    `);

    const offers = result.rows.map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      code: offer.code,

      discountType: offer.discount_type,
      discountValue: Number(offer.discount_value),

      restaurantId: offer.restaurant_id,
      restaurantName: offer.restaurant_name,

      minimumOrder: Number(offer.minimum_order),

      active: offer.active,
      expiresAt: offer.expires_at,
    }));

    res.json(offers);
  } catch (error) {
    console.error("GET OFFERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch offers",
    });
  }
});
/* =========================================
   VALIDATE PROMO CODE
========================================= */

app.post("/api/offers/validate", async (req, res) => {
  try {
    const {
      code,
      subtotal,
      restaurantId,
    } = req.body;

    // Basic validation
    if (!code || subtotal === undefined) {
      return res.status(400).json({
        valid: false,
        message: "Promo code and subtotal are required",
      });
    }

    const numericSubtotal = Number(subtotal);

    if (
      Number.isNaN(numericSubtotal) ||
      numericSubtotal < 0
    ) {
      return res.status(400).json({
        valid: false,
        message: "Invalid order subtotal",
      });
    }

    // Find active and non-expired offer
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        code,
        discount_type,
        discount_value,
        restaurant_id,
        minimum_order,
        expires_at
      FROM offers

      WHERE UPPER(code) = UPPER($1)

      AND active = TRUE

      AND (
        expires_at IS NULL
        OR expires_at > CURRENT_TIMESTAMP
      )

      LIMIT 1
      `,
      [code.trim()]
    );

    // Promo doesn't exist / expired / inactive
    if (result.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message:
          "This promo code is invalid or has expired.",
      });
    }

    const offer = result.rows[0];

    const minimumOrder =
      Number(offer.minimum_order);

    const discountValue =
      Number(offer.discount_value);

    // Check minimum order
    if (numericSubtotal < minimumOrder) {
      return res.status(400).json({
        valid: false,

        message:
          `Minimum order of $${minimumOrder.toFixed(
            2
          )} is required for this offer.`,
      });
    }

    // Check restaurant-specific offer
    if (
      offer.restaurant_id !== null &&
      Number(restaurantId) !==
        Number(offer.restaurant_id)
    ) {
      return res.status(400).json({
        valid: false,

        message:
          "This offer is not valid for this restaurant.",
      });
    }

    let discountAmount = 0;
    let freeDelivery = false;

    // Percentage discount
    if (
      offer.discount_type === "percentage"
    ) {
      discountAmount =
        numericSubtotal *
        (discountValue / 100);
    }

    // Fixed discount
    else if (
      offer.discount_type === "fixed"
    ) {
      discountAmount = Math.min(
        discountValue,
        numericSubtotal
      );
    }

    // Free delivery
    else if (
      offer.discount_type ===
      "free_delivery"
    ) {
      freeDelivery = true;
    }

    // Unknown discount type
    else {
      return res.status(400).json({
        valid: false,
        message: "Unsupported offer type",
      });
    }

    discountAmount =
      Math.round(discountAmount * 100) / 100;

    res.json({
      valid: true,

      message: `${offer.code} applied successfully!`,

      offer: {
        id: offer.id,
        title: offer.title,
        code: offer.code,

        discountType:
          offer.discount_type,

        discountValue,

        discountAmount,

        freeDelivery,

        restaurantId:
          offer.restaurant_id,

        minimumOrder,
      },
    });
  } catch (error) {
    console.error(
      "VALIDATE OFFER ERROR:",
      error
    );

    res.status(500).json({
      valid: false,
      message: "Unable to validate promo code",
    });
  }
});

/* =========================================
   REGISTER USER
========================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
    } = req.body;

    /* BASIC VALIDATION */

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    /* EMAIL FORMAT */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    /* PASSWORD LENGTH */

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    /* CHECK EXISTING USER */

    const existingUser =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /* HASH PASSWORD */

    const saltRounds = 12;

    const passwordHash =
      await bcrypt.hash(
        password,
        saltRounds
      );

    /* SAVE USER */

    const result =
      await pool.query(
        `
        INSERT INTO users (
          full_name,
          email,
          password_hash
        )

        VALUES ($1, $2, $3)

        RETURNING
          id,
          full_name,
          email,
          created_at
        `,
        [
          fullName.trim(),
          normalizedEmail,
          passwordHash,
        ]
      );

    const user = result.rows[0];

    /* NEVER RETURN PASSWORD HASH */

    res.status(201).json({
      success: true,

      message:
        "Account created successfully.",

      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER USER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create account.",
    });
  }
});
/* =========================================
   LOGIN USER
========================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const result =
      await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          password_hash
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const user =
      result.rows[0];

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,

      message:
        "Login successful.",

      token,

      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN USER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to log in.",
    });
  }
});
/* =========================================
   UPDATE ORDER STATUS
   Development/demo endpoint
========================================= */

app.patch(
  "/api/orders/:id/status",
  requireAuth,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      const result = await pool.query(
        `
        UPDATE orders

        SET status = $1

        WHERE id = $2
        AND user_id = $3

        RETURNING
          id,
          order_number,
          status,
          created_at
        `,
        [
          status,
          orderId,
          req.user.userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      const order = result.rows[0];

      res.json({
        success: true,

        message: "Order status updated.",

        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          createdAt: order.created_at,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update order status.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `BiteRush server running on http://localhost:${PORT}`
  );
});