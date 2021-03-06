import React from 'react'
import {connect} from 'react-redux'
import {me} from '../store/reducers/user'
import {getPastOrders} from '../store/reducers/orders'
import OrderHistoryItem from './OrderHistoryItem'

class OrderHistory extends React.Component {
  componentDidMount() {
    this.props.me()
    this.props.getPastOrders(this.props.user.id)
  }

  render() {
    const {user, orders} = this.props
    return (
      <div id="orderHistory">
        <div id="orderHistoryLeft">
          {orders.map((order, index) => {
            return (
              <OrderHistoryItem key={order.id} order={order} index={index} />
            )
          })}
        </div>
        <div id="orderHistoryRight">
          <h1>
            {user.firstName} {user.lastName}'s Order History
          </h1>
          <h2>Number of Orders: {orders.length}</h2>
          <h2>
            Total Spending: $
            {orders.reduce(
              (a, b) =>
                a +
                b.orderProducts.reduce(
                  (a, b) => a + b.checkoutPrice * b.quantity,
                  0
                ),
              0
            ) / 100}
          </h2>
        </div>
      </div>
    )
  }
}

const mapState = state => {
  return {
    user: state.user,
    orders: state.orders
  }
}

const mapDispatch = dispatch => {
  return {
    me: () => dispatch(me()),
    getPastOrders: id => dispatch(getPastOrders(id))
  }
}

export default connect(mapState, mapDispatch)(OrderHistory)
