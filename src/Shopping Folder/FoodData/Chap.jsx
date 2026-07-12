import React from 'react'
import { ChapData } from '../datas/chapathi'
import {Link} from 'react-router-dom'


 const Chap = () => {
  return (

    <>
    <div className ='idly' >
            <div className='header-container'>
                <h2>Chapathi</h2>
            </div>

    <div className='products-container'>
        {ChapData.map((item)=>{
            return (
                <Link to={`/Chapati/${item.id}`}>
                <div className="animate">

                <div className='image-container' key={item.id}>
                    <img src={item.image} alt={item.name}/>
                    
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

export default Chap