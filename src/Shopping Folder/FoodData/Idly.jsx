import React from 'react'
import {idlyData} from '../datas/idly'
import {Link} from 'react-router-dom'



const Idly = () => {
  return (
    
<>
    <div className='idly'>
      <div className='header-container'>
        <h2>Idli</h2>
        </div>
      
      <div className='products-container'>
      {idlyData.map((item)=>{
        return(
          <Link to ={`/Idly/${item.id}`}>
                             <div className="animate">

          <div className='image-container'>
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

export default Idly