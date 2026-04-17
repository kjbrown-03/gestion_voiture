import { useEffect, useState } from "react";
import { BadgeCheck, CarFront, FileText, PlusCircle, Users, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApiService } from "../services/api";
import { Car } from "../types";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const DEFAULT_ADMIN_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg/800px-2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2014_Peugeot_308_Active_e-HDi_115_1.6.jpg/800px-2014_Peugeot_308_Active_e-HDi_115_1.6.jpg"
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>({
    stats: { users: 0, cars: 0, activeReservations: 0, revenue: 0 },
    users: [],
    cars: [],
    reservations: []
  });
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [editingImagesForCar, setEditingImagesForCar] = useState<Car | null>(null);
  const [editingImagesLocal, setEditingImagesLocal] = useState<string[]>([]);
  const [editingImageInput, setEditingImageInput] = useState("");
  const [formError, setFormError] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [newCar, setNewCar] = useState<any>({
    make: "Toyota",
    model: "Corolla",
    year: new Date().getFullYear(),
    pricePerDay: 25000,
    location: "Douala",
    category: "SUV",
    seats: 5,
    transmission: "Automatique",
    images: []
  });

  const fetchData = async () => {
    const [overviewData, carsData] = await Promise.all([
      ApiService.getAdminOverview(),
      ApiService.getCars()
    ]);
    setOverview(overviewData);
    setMyCars(carsData.filter((car) => car.ownerId === user?.id));
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, [user?.id]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError("");
      const added = await ApiService.createCar({
        ...newCar,
        images: newCar.images.length > 0 ? newCar.images : DEFAULT_ADMIN_IMAGES
      });
      setMyCars((current) => [added, ...current]);
      setIsAddingCar(false);
      setImageInput("");
      setNewCar({
        make: "Toyota",
        model: "Corolla",
        year: new Date().getFullYear(),
        pricePerDay: 25000,
        location: "Douala",
        category: "SUV",
        seats: 5,
        transmission: "Automatique",
        images: []
      });
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    }
  };

  const addImageUrl = () => {
    if (!imageInput.trim()) return;
    setNewCar((current: any) => ({ ...current, images: [...current.images, imageInput.trim()] }));
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
      setMyCars((current) => current.map((car) =>
        car.id === editingImagesForCar.id
          ? { ...car, images: editingImagesLocal.length ? editingImagesLocal : car.images }
          : car
      ));
      setEditingImagesForCar(null);
      await fetchData();
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
    setEditingImagesLocal((current) => [...current, ...importedImages]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration LocAutoCM</h1>
          <p className="text-sm text-gray-500 mt-2">Compte admin: admin@gmail.com / admin</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <BadgeCheck className="w-4 h-4" /> Admin
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Utilisateurs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Vehicules</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.cars}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Reservations actives</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.activeReservations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Facturation</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{Number(overview.stats.revenue).toLocaleString("fr-FR")} FCFA</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Mes vehicules ajoutes</h2>
          <button onClick={() => setIsAddingCar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Ajouter une voiture
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ImageWithFallback src={car.images[0]} alt={`${car.make} ${car.model}`} className="h-48 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{car.make} {car.model}</h3>
                <p className="text-sm text-gray-600">{car.location} • {car.category}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">{car.pricePerDay.toLocaleString("fr-FR")} FCFA/j</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingImagesForCar(car);
                      setEditingImagesLocal([...car.images]);
                      setEditingImageInput("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
          {myCars.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
              Aucun vehicule ajoute par cet admin pour le moment.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Utilisateurs</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {overview.users.map((entry: any) => (
              <div key={entry.id} className="p-4">
                <p className="font-semibold text-gray-900">{entry.name}</p>
                <p className="text-sm text-gray-600">{entry.email}</p>
                <p className="text-sm text-blue-600 mt-1">{entry.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <CarFront className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Voitures</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {overview.cars.map((car: any) => (
              <div key={car.id} className="p-4">
                <p className="font-semibold text-gray-900">{car.make} {car.model}</p>
                <p className="text-sm text-gray-600">{car.owner_name} • {car.location}</p>
                <p className={`text-sm mt-1 ${car.available ? "text-green-600" : "text-red-600"}`}>
                  {car.available ? "Disponible" : "Indisponible"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Reservations et locations</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {overview.reservations.map((reservation: any) => (
            <div key={reservation.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{reservation.car_name}</p>
                <p className="text-sm text-gray-600">{reservation.renter_name} {"->"} {reservation.owner_name}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-700">{reservation.type}</p>
                <p className="text-sm text-blue-600">{Number(reservation.total_price).toLocaleString("fr-FR")} FCFA</p>
                <p className="text-sm text-gray-500">{reservation.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddingCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un vehicule</h2>
              <button onClick={() => setIsAddingCar(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCar} className="p-6 space-y-4">
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={newCar.make} onChange={(e) => setNewCar({ ...newCar, make: e.target.value })} className="rounded-xl border border-gray-200 p-3" placeholder="Marque" />
                <input required value={newCar.model} onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} className="rounded-xl border border-gray-200 p-3" placeholder="Modele" />
                <input required type="number" value={newCar.year} onChange={(e) => setNewCar({ ...newCar, year: Number(e.target.value) })} className="rounded-xl border border-gray-200 p-3" placeholder="Annee" />
                <input required type="number" value={newCar.pricePerDay} onChange={(e) => setNewCar({ ...newCar, pricePerDay: Number(e.target.value) })} className="rounded-xl border border-gray-200 p-3" placeholder="Prix par jour" />
                <input required value={newCar.location} onChange={(e) => setNewCar({ ...newCar, location: e.target.value })} className="rounded-xl border border-gray-200 p-3" placeholder="Ville" />
                <input required value={newCar.category} onChange={(e) => setNewCar({ ...newCar, category: e.target.value })} className="rounded-xl border border-gray-200 p-3" placeholder="Categorie" />
                <input required type="number" value={newCar.seats} onChange={(e) => setNewCar({ ...newCar, seats: Number(e.target.value) })} className="rounded-xl border border-gray-200 p-3" placeholder="Places" />
                <select value={newCar.transmission} onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })} className="rounded-xl border border-gray-200 p-3">
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 rounded-xl border border-gray-200 p-3" placeholder="URL image" />
                <button
                  type="button"
                  onClick={() => {
                    if (!imageInput.trim()) return;
                    setNewCar((current: any) => ({ ...current, images: [...current.images, imageInput.trim()] }));
                    setImageInput("");
                  }}
                  className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
                >
                  Ajouter
                </button>
              </div>
              <div>
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
              <div className="space-y-2">
                {newCar.images.map((image: string, index: number) => (
                  <div key={`${image}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="truncate mr-3">{image.startsWith("data:image") ? `Image importee ${index + 1}` : image}</span>
                    <button type="button" onClick={() => setNewCar({ ...newCar, images: newCar.images.filter((_: string, i: number) => i !== index) })} className="text-red-600">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddingCar(false)} className="rounded-xl px-5 py-2.5 text-gray-600 hover:bg-gray-100">Annuler</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingImagesForCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Modifier les images ({editingImagesForCar.make} {editingImagesForCar.model})</h2>
              <button onClick={() => setEditingImagesForCar(null)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateImages} className="p-6 space-y-4">
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formError}</div>}
              <div className="flex gap-2">
                <input value={editingImageInput} onChange={(e) => setEditingImageInput(e.target.value)} className="flex-1 rounded-xl border border-gray-200 p-3" placeholder="Nouvelle URL d'image" />
                <button
                  type="button"
                  onClick={() => {
                    if (!editingImageInput.trim()) return;
                    setEditingImagesLocal((current) => [...current, editingImageInput.trim()]);
                    setEditingImageInput("");
                  }}
                  className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
                >
                  Ajouter
                </button>
              </div>
              <div>
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
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {editingImagesLocal.map((img, i) => (
                  <div key={`${img}-${i}`} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <img src={img} className="h-20 w-32 object-cover rounded" alt="Apercu" />
                    <button type="button" onClick={() => setEditingImagesLocal((current) => current.filter((_, idx) => idx !== i))} className="text-sm font-medium text-red-600">
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingImagesForCar(null)} className="rounded-xl px-5 py-2.5 text-gray-600 hover:bg-gray-100">Annuler</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white hover:bg-blue-700">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
