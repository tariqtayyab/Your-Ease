  // backend/server.js
  import express from "express";
  import mongoose from "mongoose";
  import dotenv from "dotenv";
  import cors from "cors";

  import authRoutes from "./routes/authRoutes.js";
  import productRoutes from "./routes/productRoutes.js";
  import cartRoutes from "./routes/cartRoutes.js";
  import orderRoutes from "./routes/orderRoutes.js";
  import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
  import adminRoutes from "./routes/adminRoutes.js";
  import path from "path";
  import { fileURLToPath } from "url";
  import uploadRoutes from "./routes/uploadRoutes.js";
  import categoryRoutes from "./routes/categoryRoutes.js";
  import bannerRoutes from "./routes/bannerRoutes.js";
  import userRoutes from './routes/userRoutes.js';
  import wishlistRoutes from './routes/wishlistRoutes.js';
  import addressRoutes from './routes/addressRoutes.js';
  import paymentRoutes from './routes/paymentRoutes.js';
  import reviewRoutes from "./routes/reviewRoutes.js";
  import importRoutes from './routes/importRoutes.js';
  import contactRoutes from './routes/contactRoutes.js';
  import saleRoutes from './routes/saleRoutes.js';
  

  dotenv.config();
  const app = express();

  app.use(cors({
  origin: true,  
  credentials: true,
}));
  app.use(express.json());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

  // routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use("/api", reviewRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/import", importRoutes);
  app.use("/api/sales", saleRoutes);
  app.use("/api/banners", bannerRoutes); // <-- dedicated route
  app.use('/api', contactRoutes);
  app.use("/api/admin", adminRoutes);




  app.get("/", (req, res) => res.send("Your Ease backend is running"));

  // error middlewares
  app.use(notFound);
  app.use(errorHandler);

  // connect & start
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
    console.log("✅ Data retention scheduler started");
      app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Failed:", error);
      process.exit(1);
    });
