import React from 'react'
import {Link} from 'react-router-dom'

const ProductThumb = props => {
  const {product} = props

  return (
    <div className="productThumb">
      <Link to={`/products/${product.id}`}>
        <img src={'/' + product.imgPath} className="productThumbImg" />
      </Link>
      <div className="productThumbInfo">
        <Link to={`/products/${product.id}`}>
          <div>{product.name}</div>
        </Link>
        <div>{product.price}</div>
        <button>ADD TO CART</button>
      </div>
    </div>
  )
}

export default ProductThumb
