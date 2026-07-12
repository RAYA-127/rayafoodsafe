import React from 'react'
import { bondData } from '../datas/bonda'
import {Link} from 'react-router-dom'



export const Bonda = () => {
  return (

    <>
    <div className='idly'>

        <div className='header-container'>
            <h2>Bonda</h2>
        </div>

        <div className='products-container'>
        {bondData.map((item)=>{
            return(
              <Link to={`/Bonda/${item.id}`}>
              <div className="animate">

                <div className='image-container' key={item.id}>
                    <img src = {item.image} alt={item.name}/>

                    <div className='image-container-details'>
                      <h3>  {item.name}<br/> </h3>
                        {item.price} <br/>
                    </div>
                </div>
                </div>
            </Link>
            )
        })}
    </div>
    </div>
    </>
  )
}
export default Bonda
