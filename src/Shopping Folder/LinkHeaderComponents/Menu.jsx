import React from 'react'
import { allFoods } from "../datas/allFoods";
import { useCart } from '../AllComponents/UseContext/CartContext';





const Menu = () => {
    const {addToCart}=useCart();
  return (
    <>
    <div>               
<div className="menupage-container">
            {allFoods.map((item) => {
                return (
                    <div className="menupage-products" key={item.id}>
                       
                        <div className="menu-page-image-block">
                            <img src={item.image} alt={item.name} className="allfoods-images" />
                         <h3 className="menu-item-name">{item.name}
                          <span><p className="menu-item-price">Price : {item.price}</p> </span> 
                           <button className="menu-item-button"
                           onClick={()=>{addToCart(item)}}
                           >Add to Cart</button>
                           </h3>  
                         </div>
                        </div>
                    
                )
            })}
        </div>
        



    </div>
    </>
  )
}

export default Menu