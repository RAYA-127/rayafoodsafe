import React from 'react'
import './App.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dosa from './Shopping Folder/FoodData/Dosa'
import Idly from './Shopping Folder/FoodData/Idly'
import Chap from './Shopping Folder/FoodData/Chap'
import Bonda from './Shopping Folder/FoodData/Bonda'
import Puri from './Shopping Folder/FoodData/Puri'
import Upma from './Shopping Folder/FoodData/Upma'
import { Header } from './Shopping Folder/AllComponents/Header'
import { Products } from './Shopping Folder/MainPage/Products'
import { CartProvider } from './Shopping Folder/AllComponents/UseContext/CartContext'

// Dynamic Routing useParams
import Dosadata from './Shopping Folder/AllComponents/DynamicRouting/Dosadata'
import Idlidata from './Shopping Folder/AllComponents/DynamicRouting/Idlidata'
import Chapatidata from './Shopping Folder/AllComponents/DynamicRouting/Chapathidata'
import { Bondadata } from './Shopping Folder/AllComponents/DynamicRouting/Bondadata'
import { Puridata } from './Shopping Folder/AllComponents/DynamicRouting/Puridata'
import Upmadata from './Shopping Folder/AllComponents/DynamicRouting/Upmadata'

// Cart
import CartPage from './Shopping Folder/AllComponents/UseContext/CartPage'

// Header linked pages
import SigninPage from './Shopping Folder/LinkHeaderComponents/SigninPage'
import { HomePage } from './Shopping Folder/LinkHeaderComponents/HomePage'
import Menu from './Shopping Folder/LinkHeaderComponents/Menu'
import { Offers } from './Shopping Folder/LinkHeaderComponents/Offers'
import { Help } from './Shopping Folder/LinkHeaderComponents/Help'
import { Profile } from './Shopping Folder/LinkHeaderComponents/Profile'

// Live Tracking
import OderTracking from './Shopping Folder/AllComponents/UseContext/OderTracking'


// Layout wrapper — shows Header + child page
const WithHeader = ({ children }) => (
  <div>
    <Header />
    {children}
  </div>
)

const App = () => {
  return (
    <div className='App'>
      <CartProvider>
        <HashRouter>
          <Routes>

            {/* Clean pages — NO header */}
            <Route path='/Sign In'      element={<SigninPage />} />
            <Route path='/track-order'  element={<OderTracking />} />
            <Route path='/Home'         element={<HomePage />} />
           
            {/* Root redirect → Menu */}
            <Route path='/' element={<Navigate to='/Menu' replace />} />

            {/* Pages WITH header */}
            <Route path='/Menu'         element={<WithHeader><Products /></WithHeader>} />
            <Route path='/Dosa'         element={<WithHeader><Dosa /></WithHeader>} />
            <Route path='/Idly'         element={<WithHeader><Idly /></WithHeader>} />
            <Route path='/Chapati'      element={<WithHeader><Chap /></WithHeader>} />
            <Route path='/Bonda'        element={<WithHeader><Bonda /></WithHeader>} />
            <Route path='/Puri'         element={<WithHeader><Puri /></WithHeader>} />
            <Route path='/Upma'         element={<WithHeader><Upma /></WithHeader>} />

            {/* Dynamic routes */}
            <Route path='/Dosa/:id'     element={<WithHeader><Dosadata /></WithHeader>} />
            <Route path='/Idly/:id'     element={<WithHeader><Idlidata /></WithHeader>} />
            <Route path='/Chapati/:id'  element={<WithHeader><Chapatidata /></WithHeader>} />
            <Route path='/Bonda/:id'    element={<WithHeader><Bondadata /></WithHeader>} />
            <Route path='/Puri/:id'     element={<WithHeader><Puridata /></WithHeader>} />
            <Route path='/Upma/:id'     element={<WithHeader><Upmadata /></WithHeader>} />

            {/* Cart & header links */}
             <Route path='/cart'         element={<WithHeader><CartPage /></WithHeader>} />
            <Route path='/Offers'       element={<WithHeader><Offers /></WithHeader>} />
            <Route path='/Help'         element={<WithHeader><Help /></WithHeader>} />
            <Route path='/Profile'      element={<WithHeader><Profile /></WithHeader>} />


          </Routes>
        </HashRouter>
      </CartProvider>
    </div>
  )
}

export default App
