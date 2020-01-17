const router = require('express').Router()
const {Order, Product, OrderProduct, User} = require('../db/models')
module.exports = router

//get all order products

router.get('/', async (req, res, next) => {
  try {
    let currentUser
    if (req.user) currentUser = await User.findByPk(req.user.id)

    if (currentUser && currentUser.isAdmin) {
      const orderProducts = await OrderProduct.findAll()
      res.json(orderProducts)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    next(err)
  }
})

//get all order products in current user's cart

router.get('/cart', async (req, res, next) => {
  try {
    const id = req.user.id
    let currentOrder = await Order.findAll({
      where: {
        userId: id,
        completed: false
      }
    })
    currentOrder = currentOrder[0]
    const cartProducts = await OrderProduct.findAll({
      where: {
        orderId: currentOrder.id
      },
      include: [
        {
          model: Product
        }
      ]
    })
    res.send(cartProducts)
  } catch (err) {
    next(err)
  }
})

// get all items from an order

router.get('/order/:orderId', async (req, res, next) => {
  try {
    const orderProducts = await OrderProduct.findAll({
      where: {
        orderId: req.params.orderId
      }
    })
    res.json(orderProducts)
  } catch (err) {
    next(err)
  }
})

// below route needs clarification

router.post('/cart', async (req, res, next) => {
  try {
    // find the users cart

    let cart = await Order.findOrCreate({
      where: {
        userId: req.user.id,
        completed: false
      }
    })

    // see if the product being added already exists

    let cartProduct = await OrderProduct.findAll({
      where: {
        orderId: cart[0].dataValues.id,
        productId: req.body.productId
      }
    })

    // if it exists increment the quantity

    if (cartProduct.length) {
      cartProduct = cartProduct[0]
      await cartProduct.update({
        quantity: cartProduct.dataValues.quantity + 1
      })
    } else {
      cartProduct = await OrderProduct.create({
        orderId: cart[0].dataValues.id,
        productId: req.body.productId,
        quantity: 1
      })
    }

    res.send(cartProduct.dataValues)
  } catch (err) {
    next(err)
  }
})

// delete an item from the cart

router.delete('/order/:orderId/:productId', async (req, res, next) => {
  try {
    const {productId, orderId} = req.params
    await OrderProduct.destroy({
      where: {
        productId: productId,
        orderId: orderId
      }
    })
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

// update the quantity of a cart item

router.put('/cart', async (req, res, next) => {
  try {
    const {productId, orderId, newQuantity} = req.body
    const orderProduct = await OrderProduct.findOne({
      where: {
        productId: productId,
        orderId: orderId
      }
    })
    await orderProduct.update({
      quantity: newQuantity
    })
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
  }
})
