import React from 'react'
import { FaShoppingCart } from "react-icons/fa";
import {Link} from 'react-router-dom';
import { useCart } from './UseContext/CartContext'
import { FaUserCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";


export const Header = () => {

  const {cart,user}=useCart();

  return (
    <div className='hamburger'>

        <div className='Header-Container'>
         
             <div  className='left-Side'> 
               <Link to="/Home">
                <div className='Title-Logo'>
                    {/* ✅ FIXED: use process.env.PUBLIC_URL so logo loads on GitHub Pages */}
                    <img src={process.env.PUBLIC_URL + '/raya.png'} alt='Raya-Logo' />
                     <h2>Raya Foods</h2>
                </div>
                </Link>
                </div>


                 <div className='Center-Side'>
                    <ul>
                        <li className='Shop'><Link to={'/Menu'}>Menu</Link></li>
                        <li className='Products'><Link to={'/Offers'}>Offers</Link></li>
                        <li className='Contact'><Link to={'/Help'}>Help</Link></li>
                        <li className='Profile'><Link to={'/Profile'}>Profile</Link></li>
                    </ul>
                </div>

                <div className='Input-Field'>
                    <div className="search2">
                        <input type="text" placeholder='Search anything ...'
                         className='Search-Box'
                         name='Search-Box'
                         />
                       <span className='search'><FaSearch size={20} /></span>  
                    </div>
                </div>

                <Link to='/cart'>
                    <div className='Cart'>
                        <span className='setcolor'>Cart</span> 
                        <span className='setcolor'>{cart.length}</span>
                        <span className='setcolor'><FaShoppingCart /></span> 
                    </div>  
                </Link>

                {/* 🔐 DYNAMIC SIGN IN BUTTON */}
                <div>
                    {!user ? (
                        <Link to='/Sign In'>
                            <div className='Right-Side'>
                                <div className="cart2">
                                    Sign In
                                    <FaUserCircle size={30} />
                                </div>  
                            </div>
                        </Link>
                    ) : (
                        <span className="user-greeting-badge">Welcome, {user.name}!</span>
                    )}
                </div>

        </div>

        {/* List item links */}
        <div className='list-items'>
            <ul>
                <li className='dosa'><Link to="/Dosa">Dosa</Link></li>
                <li><Link to="/Idly">Idly</Link></li>
                <li><Link to="/Chapati">Chapati</Link></li>
                <li><Link to="/Bonda">Bonda</Link></li>
                <li><Link to="/Puri">Puri</Link></li>
                <li><Link to="/Upma">Upma</Link></li>
            </ul>                            
        </div>

    </div>
  )
}
