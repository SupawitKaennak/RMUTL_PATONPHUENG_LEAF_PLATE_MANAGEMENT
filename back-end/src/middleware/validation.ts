import Joi from "joi"
import type { Request, Response, NextFunction } from "express"

export const validateMaterial = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    quantity: Joi.number().required().min(0),
    unit: Joi.string().required().min(1).max(20),
    pricePerUnit: Joi.number().required().min(0),
    date: Joi.string().required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    })
  }
  next()
}

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    date: Joi.string().required(),
    description: Joi.string().required().min(1).max(200),
    category: Joi.string().required().min(1).max(50),
    amount: Joi.number().required().min(0),
    quantity: Joi.string().allow("").max(50),
    isIncome: Joi.boolean().required(),
    notes: Joi.string().allow("").max(500),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    })
  }
  next()
}

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    lot: Joi.string().required().min(1).max(20),
    date: Joi.string().required(),
    product: Joi.string().required().min(1).max(100),
    orderedQuantity: Joi.string().required().min(1).max(50),
    remainingQuantity: Joi.string().allow("").optional(),
    qcQuantity: Joi.string().allow("").optional(),
    electricityCost: Joi.number().min(0).optional(),
    materialCost: Joi.number().min(0).optional(),
    totalCost: Joi.number().min(0).optional(),
    sellingPrice: Joi.number().min(0).optional(),
    status: Joi.string().allow("").max(50).optional(),
    machineId: Joi.string().allow("").optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    })
  }
  next()
}

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30).alphanum(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(100),
    fullName: Joi.string().required().min(2).max(100),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    })
  }
  next()
}

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    })
  }
  next()
}
