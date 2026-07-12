import React from 'react'
import { Do } from '../datas/dosa'
import {Link} from 'react-router-dom'
import { useState } from 'react'


 const Dosa = () => {

    const [selectproduct , setSelectProduct] = useState([])

    const nameHandler=(handle) =>{
        if(selectproduct.includes(handle)){
            setSelectProduct(selectproduct.filter(item=>item !==handle))
        }
        else {
            setSelectProduct([...selectproduct, handle])
        }
        
    }


    const filteredData = selectproduct.length===0?
    Do: Do.filter((allmobiles)=> selectproduct.includes(allmobiles.name))



  return (
    <>
    <div className='full-page'>
            {/* <div className="filter-container">
        {Do.map((fil)=>{
            return (
                <div className='gap'>
                    <label>
                        <input type="checkbox"
                    checked= {selectproduct.includes(fil.name)}
                    onChange={()=>nameHandler(fil.name)}
                     />
                        {fil.name}
                    </label>
                </div>

            )

        })}
                
            </div> */}


    
    <div className='idly'>

        <div className='header-container'>
            <h2>Dosa</h2>
        </div>

        <div className='products-container'>
        {filteredData.map((item)=>{
            return(
               
                <Link to ={`/Dosa/${item.id}`}>
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
    </div>
    </>
  )
}
export default Dosa
