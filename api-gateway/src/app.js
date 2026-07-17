const express = require("express");
const cors = require("cors");

const {
  createProxyMiddleware
} = require("http-proxy-middleware");

const app = express();

app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "UP"
  });
});

// =========================
// AUTH
// =========================

app.use(
  "/api/employees",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/employees${path}`,
  })
);


app.use(
  "/api/roles",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/roles${path}`
  })
);


app.use(
  "/api/clients",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/clients${path}`
  })
);

// =========================
// PRODUCTS
// =========================

app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/products${path}`
  })
);

// =========================
// CATEGORIES
// =========================

app.use(
  "/api/categories",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/categories${path}`
  })
);


app.use(
  "/api/promotions",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/promotions${path}`
  })
);
// =========================
// ORDERS
// =========================

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/orders${path}`
  })
);

// =========================
// INVENTORY
// =========================

app.use(
  "/api/inventory",
  createProxyMiddleware({
    target: process.env.INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/inventory${path}`
  })
);

app.use(
  "/api/warehouses",
  createProxyMiddleware({
    target: process.env.INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/warehouses${path}`
  })
);


// =========================
// SHIPPING
// =========================

app.use(
  "/api/shipping",
  createProxyMiddleware({
    target: process.env.SHIPPING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/shipping${path}`
  })
);

// =========================
// CART
// =========================

app.use(
  "/api/cart",
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/cart${path}`
  })
);

// =========================
// LOGGING
// =========================

app.use(
  "/api/logs",
  createProxyMiddleware({
    target: process.env.LOGGING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/logs${path}`
  })
);

// =========================
// NOTIFICATIONS
// =========================

app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) =>
      `/api/notifications${path}`
  })
);

module.exports = app;