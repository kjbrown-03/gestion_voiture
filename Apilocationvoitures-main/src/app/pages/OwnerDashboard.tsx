import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Car, Reservation } from "../types";
import { PlusCircle, X } from "lucide-react";
import { Link } from "react-router";
import { ApiService } from "../services/api";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const CAR_BRANDS: Record<string, string[]> = {
  "Toyota": ["RAV4", "Hilux", "Camry", "Corolla", "Land Cruiser"],
  "Hyundai": ["Tucson", "Elantra", "Santa Fe", "Accent"],
  "Peugeot": ["208", "3008", "2008", "508"],
  "Mercedes": ["GLC", "GLE", "Classe C", "Classe A", "Classe G"],
  "Renault": ["Clio", "Master", "Kangoo", "Megane", "Duster"],
  "Ford": ["Focus", "Ranger", "Explorer", "Mustang", "Escape"],
  "Honda": ["Civic", "CR-V", "Accord", "HR-V"],
  "Nissan": ["Qashqai", "Juke", "X-Trail", "Patrol"],
  "KIA": ["Sportage", "Sorento", "Rio", "Picanto"],
  "Volkswagen": ["Golf", "Polo", "Tiguan", "Touareg"],
  "Autre": ["Autre modele"]
};

export function OwnerDashboard() {
  const { user } = useAuth();
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [formError, setFormError] = useState("");
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [imageInput, setImageInput] = useState("");
  
  const [editingImagesForCar, setEditingImagesForCar] = useState<Car | null>(null);
  const [editingImagesLocal, setEditingImagesLocal] = useState<string[]>([]);
  const [editingImageInput, setEditingImageInput] = useState("");

  const [newCar, setNewCar] = useState<any>({
    make: Object.keys(CAR_BRANDS)[0],
    model: CAR_BRANDS[Object.keys(CAR_BRANDS)[0]][0],
    year: new Date().getFullYear(),
    pricePerDay: 25000,
    location: "Douala",
    category: "SUV",
    seats: 5,
    transmission: "Automatique",
    images: []
  });

  const fetchData = async () => {
    const [allCars, allRes] = await Promise.all([
      ApiService.getCars(),
      ApiService.getReservations()
    ]);

    setMyCars(allCars.filter((c) => c.ownerId === user?.id));
    setRequests(allRes);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError("");
      const added = await ApiService.createCar({
        ...newCar,
        images: newCar.images.length > 0 ? newCar.images : [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg/800px-2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2014_Peugeot_308_Active_e-HDi_115_1.6.jpg/800px-2014_Peugeot_308_Active_e-HDi_115_1.6.jpg"
        ]
      });
      setMyCars([added, ...myCars]);
      setIsAddingCar(false);
      setNewCar({
        make: Object.keys(CAR_BRANDS)[0],
        model: CAR_BRANDS[Object.keys(CAR_BRANDS)[0]][0],
        year: new Date().getFullYear(),
        pricePerDay: 25000,
        location: "Douala",
        category: "SUV",
        seats: 5,
        transmission: "Automatique",
        images: []
      });
      setImageInput("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    }
  };

  const addImageUrl = () => {
    if (!imageInput.trim()) return;
    setNewCar({ ...newCar, images: [...newCar.images, imageInput.trim()] });
    setImageInput("");
  };

  const importImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    const importedImages = await Promise.all(readers);
    setNewCar((current: any) => ({ ...current, images: [...current.images, ...importedImages] }));
  };

  const handleUpdateImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImagesForCar) return;
    try {
      setFormError("");
      await ApiService.updateCarImages(editingImagesForCar.id, editingImagesLocal);
      // Update local state
      setMyCars(myCars.map(c => 
        c.id === editingImagesForCar.id ? { ...c, images: editingImagesLocal.length ? editingImagesLocal : c.images } : c
      ));
      setEditingImagesForCar(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  const importEditingImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    const importedImages = await Promise.all(readers);
    setEditingImagesLocal([...editingImagesLocal, ...importedImages]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Espace Proprietaire</h1>
        <button onClick={() => setIsAddingCar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 w-max">
          <PlusCircle className="w-5 h-5" />
          Ajouter une voiture en location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Mes vehicules</p>
          <p className="text-2xl font-bold text-gray-900">{myCars.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Demandes en attente</p>
          <p className="text-2xl font-bold text-gray-900">{requests.filter((r) => r.status === "pending").length}</p>
        </div>
      </div>

      <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Demandes recues</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {requests.length === 0 ? (
              <p className="text-gray-500 italic p-6">Aucune demande pour le moment.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <li key={req.id} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-lg text-gray-900">{req.carName}</p>
                        <p className="text-sm text-gray-600">
                          {req.type === "rental" ? "Location" : "Reservation"} par {req.renterName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Du {new Date(req.startDate).toLocaleDateString()} au {new Date(req.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-bold text-blue-600">{req.totalPrice.toLocaleString("fr-FR")} FCFA</p>
                        <p className="text-sm text-gray-500">{req.status === "accepted" && req.invoiceNumber ? req.invoiceNumber : "Facture envoyee apres acceptation"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await ApiService.updateReservationStatus(req.id, "accepted");
                          fetchData();
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={async () => {
                          await ApiService.updateReservationStatus(req.id, "rejected");
                          fetchData();
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                      >
                        Refuser
                      </button>
                      <span className="px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 font-medium">
                        {req.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Mes voitures en location</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCars.map((car) => (
          <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <ImageWithFallback src={car.images[0]} alt={`${car.make} ${car.model}`} className="h-48 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{car.make} {car.model}</h3>
              <p className="text-sm text-gray-500 mb-2">{car.year} • {car.category}</p>
              <p className="text-sm text-gray-600 mb-4">Proprietaire: {car.ownerName}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-lg font-bold text-blue-600">{car.pricePerDay.toLocaleString("fr-FR")} FCFA/j</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {car.available ? "Disponible" : "Reservee/Louee"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex gap-2">
              <Link to={`/cars/${car.id}`} className="flex-1 text-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Voir
              </Link>
              <button onClick={() => {
                setEditingImagesForCar(car);
                setEditingImagesLocal([...car.images]);
                setEditingImageInput("");
              }} className="flex-1 text-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Images
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un vehicule</h2>
              <button onClick={() => setIsAddingCar(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCar} className="p-6 space-y-6">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 mb-1">Marque</label>
                  <select 
                    value={newCar.make} 
                    onChange={(e) => {
                      const make = e.target.value;
                      setNewCar({ ...newCar, make, model: CAR_BRANDS[make][0] });
                    }} 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white"
                  >
                    {Object.keys(CAR_BRANDS).map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-500 mb-1">Modèle</label>
                  <select 
                    value={newCar.model} 
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white"
                  >
                    {CAR_BRANDS[newCar.make]?.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <input required type="number" value={newCar.year} onChange={(e) => setNewCar({ ...newCar, year: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl p-3" placeholder="Annee" />
                <input required type="number" value={newCar.pricePerDay} onChange={(e) => setNewCar({ ...newCar, pricePerDay: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl p-3" placeholder="Prix par jour" />
                <input required type="text" value={newCar.location} onChange={(e) => setNewCar({ ...newCar, location: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3" placeholder="Ville" />
                <input required type="text" value={newCar.category} onChange={(e) => setNewCar({ ...newCar, category: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3" placeholder="Categorie" />
                <input required type="number" value={newCar.seats} onChange={(e) => setNewCar({ ...newCar, seats: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl p-3" placeholder="Places" />
                <select value={newCar.transmission} onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3">
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Images de la voiture</label>
                <div className="flex gap-2">
                  <input type="url" value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 border border-gray-200 rounded-xl p-3" placeholder="Collez une URL d'image" />
                  <button type="button" onClick={addImageUrl} className="bg-blue-600 text-white px-4 rounded-xl">Ajouter</button>
                </div>
                <div className="mt-3">
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Importer des images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        importImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-3 space-y-2">
                  {newCar.images.map((image: string, index: number) => (
                    <div key={`${image}-${index}`} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="truncate mr-3">{image.startsWith("data:image") ? `Image importee ${index + 1}` : image}</span>
                      <button type="button" onClick={() => setNewCar({ ...newCar, images: newCar.images.filter((_: string, i: number) => i !== index) })} className="text-red-600">
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddingCar(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Annuler</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors">Enregistrer la voiture</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingImagesForCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Modifier les images ({editingImagesForCar.make} {editingImagesForCar.model})</h2>
              <button onClick={() => setEditingImagesForCar(null)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateImages} className="p-6">
              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <input 
                  type="url" 
                  value={editingImageInput} 
                  onChange={(e) => setEditingImageInput(e.target.value)} 
                  className="flex-1 border border-gray-200 rounded-xl p-3" 
                  placeholder="Collez une nouvelle URL d'image" 
                />
                <button type="button" onClick={() => {
                  if(editingImageInput.trim()){
                    setEditingImagesLocal([...editingImagesLocal, editingImageInput.trim()]);
                    setEditingImageInput("");
                  }
                }} className="bg-blue-600 text-white px-4 rounded-xl">Ajouter</button>
              </div>

              <div className="mb-4">
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Importer depuis l'ordinateur
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      importEditingImages(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-2">
                {editingImagesLocal.map((img, i) => (
                  <div key={i} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate mr-4 text-gray-600 font-medium">Image {i+1}</span>
                      <button type="button" onClick={() => setEditingImagesLocal(editingImagesLocal.filter((_, idx) => idx !== i))} className="text-red-500 font-medium text-sm hover:underline">Retirer</button>
                    </div>
                    <img src={img} className="h-20 w-32 object-cover rounded shadow-sm" alt="Apeçu" />
                  </div>
                ))}
                {editingImagesLocal.length === 0 && <p className="text-gray-500 text-sm italic py-4 text-center">Aucune image. L'image par défaut sera utilisée si vous enregistrez.</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingImagesForCar(null)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">Annuler</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
