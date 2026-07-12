import { FaShoppingCart } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { allFoods } from "../datas/allFoods";
import { Link } from "react-router-dom";
import { useCart } from '../AllComponents/UseContext/CartContext'



export const HomePage = () => {

    const { user } = useCart();


  return (
    <>
        <div className='Header-Container'>
            <div className='left-Side'> 
                <div className='Title-Logo'>
     <img src={process.env.PUBLIC_URL + '/raya.png'} alt='Raya-Logo' />git add .
git commit -m "fix logo and all images"
git push origin main                    <h2>Raya Foods</h2>
                </div>
            </div>

            <div className='Center-Side'>
                <ul>
                        <li className='Shop'><Link to ={'/Menu'}>Menu</Link></li>
                    <li className='Products'><Link to ={'/Offers'}>Offers</Link></li>
                    <li className='Contact'><Link to ={'/Help'}>Help</Link></li>
                    <li className='Profile'><Link to ={'/Profile'}>Profile</Link></li>
                </ul>
            </div>

            <div className='Input-Field'>
                <div className="search2">
                    <input type="text" placeholder='Search anything ...'
                        className='Search-Box'
                        name='Search-Box'
                    />
                    <span className='search'><FaSearch size={20} /> </span>  
                </div>
            </div>

            <Link to='/cart'>
                <div className='Cart'>
                    Cart
                    <span>
                        <FaShoppingCart />
                    </span>
                </div>  
            </Link>



{/* 🔐 DYNAMIC SIGN IN BUTTON VISIBILITY */}
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
         /* If logged in, show a friendly greeting badge instead
        (or leave as null to keep completely hidden) */
        <span className="user-greeting-badge">
          Welcome, {user.name}!
        </span>
        )}
            </div>
        </div>




    <Link to="/Menu"> 
        <div className="homepage-container">
            {allFoods.map((item) => {
                return (
                    <div className="homepage-products" key={item.id}>
                       
                        <div className="home-page-image-block">
                            <img src={item.image} alt={item.name} className="allfoods-images" />
                         <p className="item-name">{item.name}</p> 
                        </div>
                    </div>
                )
            })}
        </div>
    </Link>

        {/* This div acts as the full-screen blurred background image */}
        <div className="blurred-bg-layer"></div>
    </>
  )
}