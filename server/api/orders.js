const router = require('express').Router()
const {Order, Product, User, OrderProduct} = require('../db/models')
const makeStripeCharge = require('../stripe.js')
module.exports = router

// get all orders if administrator

router.get('/', async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      const orders = await Order.findAll()
      res.json(orders)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    next(err)
  }
})

// get specific order if order belongs to user
// eager load the products in that order

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{model: Product}]
    })
    if (req.user && req.user.id === order.userId) {
      res.json(order)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    next(err)
  }
})

// get all orders for a user if authorized

router.get('/user/:userId', async (req, res, next) => {
  try {
    if (req.user && req.user.id === Number(req.params.userId)) {
      const orders = await Order.findAll({
        where: {
          userId: req.params.userId
        },
        include: [
          {
            model: OrderProduct,
            include: [
              {
                model: Product
              }
            ]
          }
        ]
      })
      res.json(orders)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    next(err)
  }
})

// checkout an order - set completed to true

router.put('/checkout', async (req, res, next) => {
  let orderId

  if (!req.user) {
    if (req.body.cartProducts.length) {
      const order = await Order.create({
        userId: req.body.userId // set to guest; 1
      })

      for (let i = 0; i < req.body.cartProducts.length; i++) {
        await OrderProduct.create({
          orderId: order.id,
          productId: req.body.cartProducts[i].productId,
          quantity: req.body.cartProducts[i].quantity
        })
      }
      await order.update({
        completed: true
      })
      orderId = order.id
      res.sendStatus(200)
    }
  }

  if (req.user) {
    if (req.body.cartProducts.length) {
      orderId = req.body.orderId
      const {cartProducts} = req.body
      const userId = req.user.id
      const totalPrice = cartProducts.reduce(
        (a, b) => Number(a) + Number(b.product.price),
        0
      )

      const order = await Order.findByPk(orderId)
      let chargeResponse
      chargeResponse = await makeStripeCharge(totalPrice, req.user.email)
      if (chargeResponse.paid) {
        cartProducts.forEach(async orderProduct => {
          const product = orderProduct.product
          await OrderProduct.update(
            {
              checkoutPrice: product.price
            },
            {
              where: {
                orderId: orderId,
                productId: orderProduct.productId
              }
            }
          )
        })

        await order.update({
          completed: true
        })

        await Order.create({
          userId: userId,
          completed: false
        })

        res.sendStatus(200)
      } else {
        res.sendStatus(401)
      }
    }
  }
})
