import { useParams } from 'react-router-dom'
import { Do } from '../../datas/dosa'
import { allFoods } from '../../datas/allFoods'
import { useCart } from '../UseContext/CartContext'
import RatingSystem from '../RatingSystem'

const Dosadata = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
   
  // FIX 1: Convert id to a Number so it matches numeric IDs inside your dataset array
  const found = Do.find((item) => Number(item.id) === Number(id))

  if (!found) {
    return (
      <div className='product-details'>
        <div className='product-info'>
          <h2>Product not found</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Main Banner Card (e.g., Chapathi with Chicken Gravy) */}
        <div className='product-details'>
          <div className='background'>
            <img src={found.image} alt={found.name} />
          </div>
          <div className='product-info'>
            <h2>{found.name}</h2>
            <h3>₹{found.price}</h3>
            <span>🕒 20-30 mins</span> 
            <p>{found.description}</p>
            <button className='btn' onClick={() => addToCart(found)}>Add to cart</button>
          </div>
        </div>
        
        {/* FIX 2: Cleaned up the broken duplicate div tags inside this mapping row */}
        <div className='allFoods'>
          {allFoods.map((food) => {
            return (
              <div key={food.id} className="allfoods-container">
                
                {/* Left Side: Text and Details Content */}
                <div className="allfood-text-content">
                  <h3 className="food-title">{food.name}</h3>
                  <span className="food-price">Price : ₹{food.price}</span>
                  <p className="food-description">{food.description}</p>
                  <span>🕒 20-30 mins</span> 
                </div>

                {/* Right Side: Image and Add Button Layer */}
                <div className="allfood-image-block">
                  <div className="second-background">
                    <div className="allfoods-images">
                      <img src={food.image} alt={food.name} />
                    </div>
                  </div>
                  
                  {/* The exact add click trigger bound to the specific item object instance */}
                  <div className="btnclass">
                    <button className="btn2" onClick={() => addToCart(food)}>
                      ADD
                    </button>
                  </div>
                </div>

              </div>
            ) 
          })}
        </div>
      </div>
      <RatingSystem foodName={found.namenp} />
    </>
  )
}

export default Dosadata