import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CartContext } from '../../Context/cartContext';
import minus from '../../assets/minus.png';
import greenAdd from '../../assets/green_add.png';

function Cart() {
  const navigate = useNavigate();
  const { cart = [], addItemToCart, removeItemFromCart, clearCart } = useContext(CartContext);

  const filteredItems = cart.filter((item) => Number(item.count || 0) > 0);

  const totalPrice = filteredItems.reduce((acc, item) => {
    const price = Number(String(item.price).replace(/[^\d.]/g, '')) || 0;
    return acc + price * item.count;
  }, 0);

  const handleAddItem = (id) => {
    const item = cart.find((dish) => (dish._id || dish.id) === id);
    if (item) addItemToCart(item);
  };

  const handleRemoveItem = (id) => {
    removeItemFromCart(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16 pt-50 md:px-16 ">
      <h1 className="mb-6 text-center text-4xl font-bold">Your Shopping Cart</h1>

      {filteredItems.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-2xl text-gray-500">Your cart is empty!</p>
          <Link to="/menu" className="mt-4 inline-block text-2xl text-blue-500 underline">
            Go back to menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const currentImageSource = item.imageSrc || item.img || '';
            return (
              <div key={item._id || item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  {currentImageSource ? <img src={currentImageSource} alt={item.name} className="h-20 w-20 rounded-xl object-cover" /> : null}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-gray-600">Price: {item.price}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-4">
                    <img src={minus} alt="Remove" className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveItem(item._id || item.id)} />
                    <p className="text-lg font-bold">{item.count}</p>
                    <img src={greenAdd} alt="Add" className="h-5 w-5 cursor-pointer" onClick={() => handleAddItem(item._id || item.id)} />
                  </div>
                  <p className="mt-2 font-bold text-green-600">Subtotal: ₹{(Number(String(item.price).replace(/[^\d.]/g, '')) || 0) * item.count}</p>
                </div>
              </div>
            );
          })}

          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <h2 className="text-2xl font-bold text-gray-700">Total Bill:</h2>
            <p className="text-2xl font-bold text-green-700">₹{totalPrice}</p>
          </div>

          <button onClick={() => navigate('/checkout', { state: { amount: totalPrice } })} className="mt-4 block w-full rounded-lg bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600">
            Proceed to Checkout
          </button>
          <button onClick={clearCart} className="mt-4 block w-full rounded-lg bg-gray-200 py-3 font-bold text-gray-700 transition hover:bg-gray-300">
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
