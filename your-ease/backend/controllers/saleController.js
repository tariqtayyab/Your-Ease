// controllers/saleController.js - UPDATED WITHOUT PRICE MODIFICATION
import Sale from "../models/Sale.js";
import Product from "../models/productModel.js";

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private/Admin
export const createSale = async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      productSelection,
      products
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: "End date must be after start date"
      });
    }

    // Create sale
    const sale = new Sale({
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      productSelection,
      products: productSelection === "selected" ? products : [],
      createdBy: req.user._id
    });

    const createdSale = await sale.save();

    // Only set activeSale reference without modifying prices
    await setActiveSaleReference(createdSale);

    res.status(201).json({
      message: "Sale created successfully",
      sale: createdSale
    });
  } catch (error) {
    console.error("Create sale error:", error);
    res.status(500).json({
      message: "Error creating sale",
      error: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    } else if (status === 'expired') {
      query.endDate = { $lt: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    }

    const sales = await Sale.find(query)
      .populate('products', 'title currentPrice images')
      .populate('appliedProducts.product', 'title currentPrice images')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get sales error:", error);
    res.status(500).json({
      message: "Error fetching sales",
      error: error.message
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private/Admin
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('products', 'title currentPrice images countInStock')
      .populate('appliedProducts.product', 'title currentPrice images countInStock')
      .populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found"
      });
    }

    res.json(sale);
  } catch (error) {
    console.error("Get sale error:", error);
    res.status(500).json({
      message: "Error fetching sale",
      error: error.message
    });
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private/Admin
export const updateSale = async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      productSelection,
      products,
      isActive
    } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        message: "Sale not found"
      });
    }

    // Remove activeSale references from old products
    await removeActiveSaleReference(sale);

    // Update sale details
    sale.title = title || sale.title;
    sale.startDate = startDate ? new Date(startDate) : sale.startDate;
    sale.endDate = endDate ? new Date(endDate) : sale.endDate;
    sale.productSelection = productSelection || sale.productSelection;
    sale.products = productSelection === "selected" ? (products || sale.products) : [];
    sale.isActive = isActive !== undefined ? isActive : sale.isActive;

    // Clear applied products
    sale.appliedProducts = [];

    const updatedSale = await sale.save();

    // Set activeSale references for new products if active
    if (updatedSale.isActive) {
      await setActiveSaleReference(updatedSale);
    }

    res.json({
      message: "Sale updated successfully",
      sale: updatedSale
    });
  } catch (error) {
    console.error("Update sale error:", error);
    res.status(500).json({
      message: "Error updating sale",
      error: error.message
    });
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        message: "Sale not found"
      });
    }

    // Remove activeSale references before deleting
    await removeActiveSaleReference(sale);

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      message: "Sale deleted successfully"
    });
  } catch (error) {
    console.error("Delete sale error:", error);
    res.status(500).json({
      message: "Error deleting sale",
      error: error.message
    });
  }
};

// @desc    Get active sales for frontend
// @route   GET /api/sales/active/current
// @access  Public
export const getActiveSales = async (req, res) => {
  try {
    const now = new Date();
    
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .populate('products', 'title currentPrice images')
    .select('title startDate endDate productSelection products');

    res.json(activeSales);
  } catch (error) {
    console.error("Get active sales error:", error);
    res.status(500).json({
      message: "Error fetching active sales",
      error: error.message
    });
  }
};

// NEW: Helper function to set activeSale reference without modifying prices
const setActiveSaleReference = async (sale) => {
  try {
    let productsToUpdate = [];
    
    if (sale.productSelection === "all") {
      productsToUpdate = await Product.find({});
    } else {
      productsToUpdate = await Product.find({ _id: { $in: sale.products } });
    }

    const updatePromises = productsToUpdate.map(async (product) => {
      // Only set activeSale reference, don't modify prices
      product.activeSale = sale._id;
      
      // Track applied product without price changes
      sale.appliedProducts.push({
        product: product._id,
        originalPrice: product.currentPrice, // Store current price as reference
        salePrice: product.currentPrice // Same as original since no discount
      });
      
      return product.save();
    });

    await Promise.all(updatePromises);
    await sale.save();
    
    console.log(`✅ Set activeSale references for ${productsToUpdate.length} products (no price changes)`);
  } catch (error) {
    console.error("Set active sale reference error:", error);
    throw error;
  }
};

// NEW: Helper function to remove activeSale reference
const removeActiveSaleReference = async (sale) => {
  try {
    const appliedProducts = await Product.find({ 
      _id: { $in: sale.appliedProducts.map(ap => ap.product) } 
    });

    const removePromises = appliedProducts.map(async (product) => {
      // Only remove activeSale reference, don't revert prices
      product.activeSale = null;
      return product.save();
    });

    await Promise.all(removePromises);
    console.log(`✅ Removed activeSale references from ${appliedProducts.length} products`);
  } catch (error) {
    console.error("Remove active sale reference error:", error);
    throw error;
  }
};