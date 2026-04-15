import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, MapPin, Calendar as CalendarIcon, Star, ArrowRight, ShieldCheck, Clock, CreditCard, User } from "lucide-react";
import { ApiService } from "../services/api";
import { Car } from "../types";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [searchParams, setSearchParams] = useState({
    location: "Douala",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });

  useEffect(() => {
    // Fetch top 3 featured cars using our mock API
    ApiService.getCars().then(data => {
      setFeaturedCars(data.slice(0, 3));
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.location) params.append("location", searchParams.location);
    if (searchParams.startDate) params.append("startDate", format(searchParams.startDate, 'yyyy-MM-dd'));
    if (searchParams.endDate) params.append("endDate", format(searchParams.endDate, 'yyyy-MM-dd'));
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1659947234309-804b7fa01cf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcm9vbiUyMG1vZGVybiUyMGNhciUyMHJvYWR8ZW58MXx8fHwxNzc2MTg3OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080")' }}
        >
          <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
            Louez le véhicule parfait <br className="hidden md:block"/>
            <span className="text-blue-400">partout au Cameroun</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Des prix abordables, une assurance complète et des contrats clairs. La location entre particuliers en toute sécurité.
          </p>

          {/* Search Box */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto backdrop-blur-sm bg-white/95">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col text-left">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Ville de départ
                </label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors h-[46px]"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Garoua">Garoua</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col text-left relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Date de début
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg hover:border-blue-500 focus:ring-blue-500 block p-3 text-left outline-none transition-colors h-[46px]">
                      {searchParams.startDate ? format(searchParams.startDate, "dd MMM yyyy", { locale: fr }) : "Choisir une date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={searchParams.startDate}
                      onSelect={(date) => setSearchParams({...searchParams, startDate: date})}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 flex flex-col text-left relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Date de fin
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg hover:border-blue-500 focus:ring-blue-500 block p-3 text-left outline-none transition-colors h-[46px]">
                      {searchParams.endDate ? format(searchParams.endDate, "dd MMM yyyy", { locale: fr }) : "Choisir une date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={searchParams.endDate}
                      onSelect={(date) => setSearchParams({...searchParams, endDate: date})}
                      disabled={(date) => date < (searchParams.startDate || new Date(new Date().setHours(0, 0, 0, 0)))}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors flex items-center justify-center gap-2 h-[46px]"
                >
                  <Search className="w-5 h-5" />
                  <span>Rechercher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Véhicules populaires</h2>
              <p className="text-gray-600 mt-2">Les voitures les mieux notées par la communauté</p>
            </div>
            <Link to="/cars" className="hidden sm:flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 group flex flex-col">
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  <ImageWithFallback 
                    src={car.images[0]} 
                    alt={`${car.make} ${car.model}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                    {car.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{car.make} {car.model}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {car.location}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">Proprietaire: {car.ownerName}</p>
                    </div>
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-blue-700 font-semibold text-sm">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      {car.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-6 mt-4">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded"><User className="w-4 h-4 text-gray-400"/> {car.seats} places</span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded capitalize">{car.transmission.substring(0,4)}.</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{car.pricePerDay.toLocaleString('fr-CM')}</span>
                      <span className="text-gray-500 text-sm"> FCFA / jour</span>
                    </div>
                    <Link 
                      to={`/cars/${car.id}`}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/cars" className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Voir tous les véhicules
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Un processus simple et sécurisé garanti par nos contrats de location conformes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-blue-100 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">1. Trouvez un véhicule</h3>
              <p className="text-gray-600">Recherchez selon vos critères (ville, dates, budget). Nos véhicules sont vérifiés.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                <CreditCard className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">2. Réservez & Payez</h3>
              <p className="text-gray-600">Paiement sécurisé et génération automatique du contrat de location pour les deux parties.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">3. Prenez la route</h3>
              <p className="text-gray-600">Rencontrez le propriétaire pour la remise des clés et l'état des lieux. Bonne route !</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">La sécurité avant tout.</h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Notre plateforme garantit la sécurité des propriétaires et des locataires. Chaque réservation inclut un contrat généré via notre API, protégeant vos intérêts au Cameroun.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <ShieldCheck className="w-6 h-6 text-blue-300 mr-3 shrink-0 mt-0.5" />
                  <span><strong>Identités vérifiées :</strong> Nous validons la CNI et le permis de conduire de chaque utilisateur.</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="w-6 h-6 text-blue-300 mr-3 shrink-0 mt-0.5" />
                  <span><strong>Contrats de location :</strong> Un contrat PDF juridiquement valable est généré à chaque réservation.</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="w-6 h-6 text-blue-300 mr-3 shrink-0 mt-0.5" />
                  <span><strong>Système de notation :</strong> La communauté s'auto-régule grâce aux avis laissés après chaque location.</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1761014586544-53fe5e1f1e25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlzJTIwaGFuZG92ZXIlMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzc2MTg3OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Remise de clés" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-2xl shadow-xl hidden sm:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {i === 4 ? '+5k' : <User className="w-5 h-5"/>}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="font-bold">Locataires satisfaits</p>
                <p className="text-sm text-gray-500">Partout au Cameroun</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
