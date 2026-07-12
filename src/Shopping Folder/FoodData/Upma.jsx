import React from 'react'
import { upData } from '../datas/upma'
import {Link} from 'react-router-dom'


export const Upma= () => {
  return (
    <>
    
    <div className='idly'>

        <div className='header-container'>
            <h2>Upma</h2>
        </div>

        <div className='products-container'>
        {upData.map((item)=>{
            return(
                <Link to={`/Upma/${item.id}`} key={item.id}>
                 <div className="animate">

                <div className='image-container' >
                    <img src = {item.image} alt={item.name}/>

                     <div className='image-container-details'>
                      <h3>  {item.name}
                        <br/> </h3>
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
export default Upma
