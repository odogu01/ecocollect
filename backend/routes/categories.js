import express from 'express'
import { body, param } from 'express-validator'
import WasteCategory from '../models/WasteCategory.js'
import { protect, generateToken } from '../middleware/auth.js'
import { isAdmin } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   GET /api/categories
// @desc    Get all waste categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await WasteCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })

    res.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid category ID')
], validate, async (req, res) => {
  try {
    const category = await WasteCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.json({
      success: true,
      category
    })
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/categories
// @desc    Create a new category (Admin only)
// @access  Private (Admin)
router.post('/', protect, isAdmin, [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('isRecyclable').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { name, price, description, isRecyclable, icon, sortOrder } = req.body

    // Check if category already exists
    const existingCategory = await WasteCategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    })
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      })
    }

    const category = await WasteCategory.create({
      name,
      price: price || 0,
      description: description || '',
      isRecyclable: isRecyclable !== false,
      icon: icon || '♻️',
      sortOrder: sortOrder || 0
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/categories/:id
// @desc    Update a category (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('isRecyclable').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { name, price, description, isRecyclable, icon, sortOrder, isActive } = req.body

    const category = await WasteCategory.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // Check for duplicate name
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await WasteCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      })
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        })
      }
    }

    const updatedCategory = await WasteCategory.findByIdAndUpdate(
      req.params.id,
      { name, price, description, isRecyclable, icon, sortOrder, isActive },
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/categories/:id
// @desc    Delete a category (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid category ID')
], validate, async (req, res) => {
  try {
    const category = await WasteCategory.findById(req.params.id)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // Soft delete - just set isActive to false
    category.isActive = false
    await category.save()

    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router