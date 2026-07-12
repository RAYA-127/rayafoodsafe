import React from 'react'
import { puriData } from '../datas/puri'
import {Link} from 'react-router-dom'



export const Puri = () => {
  return (
    <>
    <div className='idly'>

        <div className='header-container'>
            <h2>Puri</h2>
        </div>

        <div className='products-container'>
        {puriData.map((item)=>{
            return(
                <Link to={`/Puri/${item.id}`}>
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
export default Puri
