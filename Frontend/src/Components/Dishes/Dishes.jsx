import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../Context/cartContext";

import Pizza from "../../assets/Pizza_1.jpeg";
import Dosa from "../../assets/Dosa.jpeg";
import Momos from "../../assets/Momos_1.jpeg";
import Panner_Nan from "../../assets/Panner_Nan.jpeg";
import Panner_Tikka from "../../assets/Panner_Tikka.jpeg";
import Pav_Bhaji from "../../assets/Pav_Bhaji.jpeg";
import Rajma_Rice from "../../assets/Rajma_Rice.jpeg";
import Sandwich from "../../assets/Sandwich.jpeg";
import Burgur from "../../assets/Burgur_1.jpeg";
import Chola_Bhutura from "../../assets/Chola_bhutara.jpeg";
import Egg_Biryani from "../../assets/Egg_Biryani.jpeg";
import Mix_Momo from "../../assets/Mix_Momo.jpeg";
import Pasta from "../../assets/Paasta.jpeg";
import Rice_Kheer from "../../assets/Rice_Kheer.jpeg";
import add from "../../assets/add.png";
import greenAdd from "../../assets/green_add.png";
import minus from "../../assets/minus.png";
import sampleDishes from "../../data/sampleDishes";

const nameImageMap = {
  Pizza,
  Dosa,
  Momos,
  "Paneer Nan": Panner_Nan,
  "Paneer Tikka": Panner_Tikka,
  "Pav Bhaji": Pav_Bhaji,
  "Rajma Rice": Rajma_Rice,
  Sandwich,
  Burger: Burgur,
  "Chole Bhature": Chola_Bhutura,
  "Egg Biryani": Egg_Biryani,
  "Mix Momos": Mix_Momo,
  Pasta,
  "Rice Kheer": Rice_Kheer,
};

function Dishes({ category, searchTerm = "", setCategory }) {
  const { cart = [], addItemToCart, removeItemFromCart, debounce, setSearchTerm } = useContext(CartContext);
  const [dishes, setDishes] = useState(sampleDishes);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "https://food-backend-rouge.vercel.app/api";

    setLoading(true);
    setFetchError('');
    fetch(`${API}/food`)
      .then((res) => res.json())
      .then((res) => {
        console.debug('API /food response:', res);
        if (res && res.success && Array.isArray(res.data)) {
          setDishes(res.data);
          console.debug('setDishes count:', res.data.length);
        } else if (Array.isArray(res)) {

          setDishes(res);
          console.debug('setDishes count (array):', res.length);
        } else {
          console.error('Unexpected API structure:', res);
          setDishes(sampleDishes);
          setFetchError('Backend response was unexpected — showing demo dishes instead.');
        }
      })
      .catch((err) => {
        console.error(err);
        setDishes(sampleDishes);
        setFetchError(String(err) + ' — using sample data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = (_id) => {
    const item = dishes.find((dish) => dish._id === _id);
    if (item) {
      const baseUrl = (import.meta.env.VITE_API_URL || "https://food-backend-rouge.vercel.app/api").replace(/\/api$/, "");
      const resolvedImg = item.imageUrl ? `${baseUrl}${item.imageUrl}` : nameImageMap[item.name];

      addItemToCart({ ...item, imageSrc: resolvedImg });
    }
  };

  const handleRemoveItem = (_id) => {
    removeItemFromCart(_id);
  };

  const filteredDishes = dishes?.filter((dish) => {
    const matchesCategory = category === "All" || dish.category === category;
    const searchValue = (searchTerm || debounce || "").toLowerCase();
    const matchesSearch = dish.name?.toLowerCase().includes(searchValue);
    return matchesCategory && matchesSearch;
  }) || [];

  console.debug('dishes length', dishes.length, 'filtered', filteredDishes.length, 'category', category, 'searchValue', (searchTerm || debounce || ''));

  return (
    <div className="w-full px-6 md:px-16 py-8 bg-white">
      {loading && (
        <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-yellow-700 text-sm">Loading dishes...</div>
      )}
      {fetchError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm">Error loading dishes: {fetchError}</div>
      )}
      {/* {!loading && !fetchError && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-green-700 text-sm">Loaded {dishes.length} dishes — showing {filteredDishes.length}</div>
      )} */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">Top dishes near you</h1>
      </div>

      <div className="max-h-[75vh] overflow-y-auto pr-2 scrollbar-none style-scroll">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-5">
          {filteredDishes.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              {dishes.length === 0 ? (
                <div>No dishes available at the moment.</div>
              ) : (
                <>
                  <div className="mb-3">No dishes found for this category or search filter.</div>
                  <div>
                    <button
                      onClick={() => {
                        if (typeof setCategory === "function") {
                          setCategory("All");
                        }
                        if (typeof setSearchTerm === "function") setSearchTerm("");
                      }}
                      className="rounded-md bg-orange-500 px-4 py-2 text-white font-semibold"
                    >
                      Show all dishes
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            filteredDishes.map((dish) => {
              const cartItem = Array.isArray(cart)
                ? cart.find((item) => (item._id || item.id) === dish._id)
                : null;
              const baseUrl = (import.meta.env.VITE_API_URL || "https://food-backend-rouge.vercel.app/api").replace(/\/api$/, "");
              const finalImageSource = dish.imageUrl ? `${baseUrl}${dish.imageUrl}` : nameImageMap[dish.name];

              return (
                <div
                  key={dish._id}
                  className="border border-gray-300 rounded-lg p-3 shadow hover:shadow-2xl transition-all duration-300 hover:scale-110 bg-white flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={finalImageSource}
                      alt={dish.name}
                      className="h-40 w-full object-cover rounded-2xl mt-2"
                    />
                    <h3 className="mt-2 font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{dish.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="font-bold text-green-600 text-2xl">₹{dish.price}</p>

                    <div className="flex items-center pb-0.5">
                      {cartItem ? (
                        <div className="flex items-center gap-3">
                          <img
                            onClick={() => handleRemoveItem(dish._id)}
                            src={minus}
                            alt="Remove"
                            className="h-6 w-6 cursor-pointer select-none"
                          />
                          <p className="font-bold text-2xl leading-none text-gray-800 select-none">
                            {cartItem.count}
                          </p>
                          <img
                            onClick={() => handleAddItem(dish._id)}
                            src={greenAdd}
                            alt="Add"
                            className="h-6 w-6 cursor-pointer select-none"
                          />
                        </div>
                      ) : (
                        <img
                          onClick={() => handleAddItem(dish._id)}
                          src={add}
                          alt="Add"
                          className="h-6 w-6 cursor-pointer select-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            }))}
        </div>
      </div>
    </div>
  );
}

export default Dishes;
