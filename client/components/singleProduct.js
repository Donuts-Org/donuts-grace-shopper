import React from 'react'
import {connect} from 'react-redux'
import {getSingleProduct} from '../store/reducers/singleProduct'
import {addOrderProductToCart} from '../store/reducers/cartProducts'
import {
  addGuestProductToCart,
  getGuestCartProducts
} from '../store/reducers/guestCartProducts'

class SingleProduct extends React.Component {
  constructor(props) {
    super(props)
    this.addToCart = this.addToCart.bind(this)
  }

  componentDidMount() {
    this.props.getSingleProduct()
  }

  addToCart() {
    event.preventDefault()
    if (this.props.isLoggedIn) {
      this.props.addOrderProductToCart()
    } else {
      this.props.addGuestProductToCart(this.props.currentProduct)
    }
  }

  render() {
    const {
      name,
      imgPath,
      price,
      description,
      manufacturer
    } = this.props.currentProduct
    return (
      <div id="singleProduct">
        <div id="singleProductLeft">
          <img src={'/' + imgPath} />
        </div>
        <div id="singleProductRight">
          <h1>{name}</h1>
          <h2>{manufacturer}</h2>
          <h2>$ {price / 100}</h2>
          <button
            type="submit"
            className="singleProductButton"
            onClick={this.addToCart}
          >
            ADD TO CART
          </button>
          <p>{description}</p>
        </div>
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    currentProduct: state.singleProduct,
    isLoggedIn: !!state.user.id
  }
}

const mapDispatch = (dispatch, ownProps) => {
  const id = ownProps.match.params.id
  return {
    getSingleProduct: () => dispatch(getSingleProduct(id)),
    addOrderProductToCart: () => dispatch(addOrderProductToCart(id)),
    getGuestCartProducts: () => dispatch(getGuestCartProducts()),
    addGuestProductToCart: product => dispatch(addGuestProductToCart(product))
  }
}

export default connect(mapState, mapDispatch)(SingleProduct)
