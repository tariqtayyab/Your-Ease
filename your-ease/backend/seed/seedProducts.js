// backend/seed/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const sampleProducts = [
  { name: "Premium White T-Shirt", price: 1499, images: ["https://picsum.photos/400?random=1"], category: "Clothing", countInStock: 50 },
  { name: "Classic Blue Jeans", price: 2499, images: ["https://picsum.photos/400?random=2"], category: "Clothing", countInStock: 30 },
  // add more...
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
