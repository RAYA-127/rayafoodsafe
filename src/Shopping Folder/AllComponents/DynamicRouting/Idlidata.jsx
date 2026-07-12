import { useParams } from 'react-router-dom'
import { idlyData } from '../../datas/idly'
import { allFoods } from '../../datas/allFoods'
import { useCart } from '../UseContext/CartContext'


const Idlidata = () => {
  const { id } = useParams()

    const {addToCart} = useCart();
  
  const Data = idlyData.find((item) => item.id === id)

  if (!Data) {
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
    <div className='product-details'>
      <div className='background'>
        <img src={Data.image} alt={Data.name} />
      </div>
      <div className='product-info'>
        <h2>{Data.name}</h2>
        <h3>{Data.price}</h3>
        <span>🕒20- 30 mins</span> 

        <p>{Data.description}</p>

        <button className='btn'  onClick={()=>addToCart(Data)}>Add to cart</button>
      </div>
    </div>


<div className='allFoods'>
    {allFoods.map((food)=>{
            return(
                <div className="allfoods-container">

          
  <div className="allfoods-container">
    
    {/* Left Side: Text and Details Content */}
    <div className="allfood-text-content">
      <h3 className="food-title">{food.name}</h3>
      <span className="food-price">Price : {food.price}</span>
      <p className="food-description">{food.description}</p>
    </div>


    <span>🕒20- 30 mins</span> 


    {/* Right Side: Image and Add Button Layer */}
    <div className="allfood-image-block">
      <div className="second-background">
        <div className="allfoods-images">
          <img src={food.image} alt={food.name} />
        </div>
      </div>
      
      {/* Absolute positioned Add Button over the image bottom */}
      <div className="btnclass">
        <button className="btn2"
        onClick={() => addToCart(food)}
        >ADD</button>
      </div>
    </div>

  </div>
                </div>


        
            ) })}
</div>

    </>
  )
}

export default Idlidata
