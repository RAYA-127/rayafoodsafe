import './App.css';
import { MainPage } from './Shopping Folder/MainPage/MainPage';
import { CartProvider } from './Shopping Folder/AllComponents/UseContext/Cartcontext';

function App() {
  return (
    <div className="App">
      <CartProvider>
<MainPage />
      </CartProvider>
      
    </div>
  );
}

export default App;
