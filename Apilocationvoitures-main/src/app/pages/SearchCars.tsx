import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Filter, Star, MapPin, SlidersHorizontal, User, CarFront } from "lucide-react";
import { ApiService } from "../services/api";
import { Car } from "../types";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function SearchCars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCars, setAllCars] = useState<Car[]>([]);

  // Filters state
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200000);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getCars();
        setAllCars(data);
        
        // Apply filters
        let filtered = data;
        
        // Filter by location (case-insensitive and accent-insensitive)
        if (location) {
          const normalizedFilter = location.toLowerCase().replace(/[éèêë]/g, 'e');
          filtered = filtered.filter(c => {
            const normalizedLocation = c.location.toLowerCase().replace(/[éèêë]/g, 'e');
            return normalizedLocation.includes(normalizedFilter);
          });
        }
        
        // Filter by category
        if (category) {
          filtered = filtered.filter(c => c.category === category);
        }
        
        // Filter by price range
        if (minPrice > 0) {
          filtered = filtered.filter(c => c.pricePerDay >= minPrice);
        }
        if (maxPrice < 200000) {
          filtered = filtered.filter(c => c.pricePerDay <= maxPrice);
        }
        
        setCars(filtered);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [location, category, minPrice, maxPrice]);

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const availableCategories = Array.from(new Set(allCars.map((car) => car.category))).sort();

  return (
    <div className="bg-gray-50 flex-1 flex">
      {/* Sidebar Filters */}
      <aside className="w-80 bg-white border-r border-gray-200 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-8 text-gray-900">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-bold">Filtres</h2>
        </div>

        <div className="space-y-8">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                updateSearchParam("location", e.target.value);
              }}
            >
              <option value="">Toutes les villes</option>
              <option value="Douala">Douala</option>
              <option value="Yaoundé">Yaoundé</option>
              <option value="Kribi">Kribi</option>
              <option value="Bafoussam">Bafoussam</option>
              <option value="Garoua">Garoua</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
            <div className="space-y-2">
              {availableCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                  />
                  <span className="text-gray-700 text-sm">{cat}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={category === ""}
                  onChange={() => setCategory("")}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                />
                <span className="text-gray-500 text-sm italic">Toutes catégories</span>
              </label>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Intervalle de prix
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="5000"
                value={minPrice}
                onChange={(e) => setMinPrice(parseInt(e.target.value || "0"))}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Prix min"
              />
              <input
                type="number"
                min="0"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value || "0"))}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Prix max"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Min: {minPrice.toLocaleString('fr-CM')} FCFA</span>
              <span>Max: {maxPrice.toLocaleString('fr-CM')} FCFA</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Véhicules disponibles {location ? `à ${location}` : ""}
            </h1>
            <button className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              <Filter className="w-4 h-4" /> Filtres
            </button>
          </div>

          <p className="text-gray-500 mb-8">{cars.length} résultat(s) trouvé(s)</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-80 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col group">
                  <Link to={`/cars/${car.id}`} className="block relative h-48 overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                      {car.category}
                    </div>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/cars/${car.id}`} className="hover:text-blue-600 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{car.make} {car.model}</h3>
                      </Link>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-semibold shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        {car.rating.toFixed(1)}
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {car.location}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">Proprietaire: {car.ownerName}</p>

                    <div className="flex gap-3 text-xs text-gray-600 mb-6">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <User className="w-3.5 h-3.5 text-gray-400" /> {car.seats}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <CarFront className="w-3.5 h-3.5 text-gray-400" />
                        <span className="capitalize">{car.transmission.substring(0,4)}.</span>
                      </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <span className="text-xl font-bold text-blue-600">{car.pricePerDay.toLocaleString('fr-CM')}</span>
                        <span className="text-gray-500 text-xs"> FCFA / j</span>
                      </div>
                      <Link
                        to={`/cars/${car.id}`}
                        className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Voir plus
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <CarFront className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun véhicule trouvé</h3>
              <p className="text-gray-500 mb-6">Essayez de modifier vos filtres de recherche.</p>
              <button
                onClick={() => {
                  setLocation("");
                  setCategory("");
                  setMinPrice(0);
                  setMaxPrice(200000);
                  setSearchParams(new URLSearchParams());
                }}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
