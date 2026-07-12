import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dosa from './Shopping Folder/FoodData/Dosa'
import Idly from './Shopping Folder/FoodData/Idly'
import Chap from './Shopping Folder/FoodData/Chap'
import Bonda from './Shopping Folder/FoodData/Bonda'
import Puri from './Shopping Folder/FoodData/Puri'
import Upma from './Shopping Folder/FoodData/Upma'
import { Header } from './Shopping Folder/AllComponents/Header'
import { Products } from './Shopping Folder/MainPage/Products'
import { CartProvider } from './Shopping Folder/AllComponents/UseContext/CartContext'


//Dynamic Routing useParams 
import Dosadata from './Shopping Folder/AllComponents/DynamicRouting/Dosadata'
import Idlidata from './Shopping Folder/AllComponents/DynamicRouting/Idlidata'
import Chapatidata from './Shopping Folder/AllComponents/DynamicRouting/Chapathidata'
import { Bondadata } from './Shopping Folder/AllComponents/DynamicRouting/Bondadata'
import {Puridata} from './Shopping Folder/AllComponents/DynamicRouting/Puridata'
import Upmadata from './Shopping Folder/AllComponents/DynamicRouting/Upmadata'


//userCart to add cart button , item will be added to cart
import CartPage from './Shopping Folder/AllComponents/UseContext/CartPage'


/*Link to all Header components 
1) Sign in page 
2)Home Page
3)Menu page
4)Products Page */
import SigninPage from './Shopping Folder/LinkHeaderComponents/SigninPage'
import {HomePage} from './Shopping Folder/LinkHeaderComponents/HomePage'

/*3)Menu Page*/
import Menu from './Shopping Folder/LinkHeaderComponents/Menu'

/*3)Menu Page*/
import {Offers} from './Shopping Folder/LinkHeaderComponents/Offers'
import {Help} from './Shopping Folder/LinkHeaderComponents/Help'
import {Profile} from './Shopping Folder/LinkHeaderComponents/Profile'
 


/*Live Tracking Page*/
import OderTracking from './Shopping Folder/AllComponents/UseContext/OderTracking'


const App = () => {
  return (
    <div className='App'>
       <CartProvider>
      <BrowserRouter>

{/* --- 1. CLEAN SIGN IN PAGE (No Navbar, No Layouts) --- */}
            <Routes>
               <Route path='/Sign In' element={<SigninPage/>}/>


                {/*3) Live Tracking Page */}
                 <Route path='/track-order' element={<OderTracking/>}/>  

                {/*Link to all Header components 
          2)Home Page
          */}
             <Route path='/Home' element={<HomePage/>}/>

             

            


{/* --- 2. ALL OTHER PAGES (With Navbar and Layouts) --- */}
    <Route
     path= '/*'
    element={
        <div>
        
            <Header/>
            <Routes>



 {/*Linking to all food pages */}
          <Route path='/' element={<Products />} />
          <Route path='/Dosa' element={<Dosa />} />
          <Route path='/Idly' element={<Idly />} />
          <Route path='/Chapati' element={<Chap />} />
          <Route path='/Bonda' element={<Bonda />} />
          <Route path='/Puri' element={<Puri />} />
          <Route path='/Upma' element={<Upma />} />


          {/*Dynamic Routing useParams */}
          <Route path='/Dosa/:id' element={<Dosadata/>}/>
          <Route path='/Idly/:id' element={<Idlidata/>}/>
          <Route path='/Chapati/:id' element={<Chapatidata/>}/>
          <Route path='/Bonda/:id' element={<Bondadata/>}/>
          <Route path='/Puri/:id' element={<Puridata/>}/>
          <Route path='/Upma/:id' element={<Upmadata/>}/>


        
    {/*userCart to add cart button , item will be added to cart*/}
          <Route path='/cart' element={<CartPage/>}/>

          <Route path='/Menu' element={<Menu/>}/>
          <Route path='/Offers' element={<Offers/>}/>
          <Route path='/Help' element={<Help/>}/>
          <Route path='/Profile' element={<Profile/>}/>


            

            </Routes>
       

</div>
  
    }
    />
      </Routes>
      </BrowserRouter>
</CartProvider>
       
    </div>
  )
}

export default App