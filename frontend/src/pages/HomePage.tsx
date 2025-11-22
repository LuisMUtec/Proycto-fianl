import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export function HomePage() {
  const navigate = useNavigate();
  const categories = [
    {
      id: 'hamburguesas',
      name: 'Hamburguesas',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
      description: 'Nuestras legendarias hamburguesas con sabor único',
    },
    {
      id: 'entradas',
      name: 'Entradas',
      image: 'https://frdadmin21.fridaysperu.com/media/catalog/product/b/a/bacon_cheese_800x800.jpg',
      description: 'Alitas, deditos de pollo y más para compartir',
    },
    {
      id: 'acompañamientos',
      name: 'Acompañamientos',
      image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg',
      description: 'Papas fritas ilimitadas y mucho más',
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
      description: 'Refrescos, limonadas y bebidas especiales',
    },
    {
      id: 'postres',
      name: 'Postres',
      image: 'https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg',
      description: 'Brownies, helados y dulces irresistibles',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replaced single hero image with a 3x2 full-width grid of banners */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Row 1 - Left (1) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/HOME_TACO_WEEK_Comprimido.jpg"
              alt="Promo 1"
              className="block w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          </div>

          {/* Row 1 - Right (2) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/RIBA_HOME_Comprimido.jpg"
              alt="Promo 2"
              className="block w-full h-full object-cover"
            />
          </div>

          {/* Row 2 - Left (3) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/RIBA_HOME_Comprimido.jpg"
              alt="Promo 3"
              className="block w-full h-full object-cover"
            />
          </div>

          {/* Row 2 - Right (4) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/RIBA_HOME_Comprimido.jpg"
              alt="Promo 4"
              className="block w-full h-full object-cover"
            />
          </div>

          {/* Row 3 - Left (5) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/Banner_Home_Mobile_Desktop.jpg"
              alt="Promo 5"
              className="block w-full h-full object-cover"
            />
          </div>

          {/* Row 3 - Right (6) */}
          <div className="relative h-[320px] md:h-[420px] w-full overflow-hidden">
            <img
              src="https://frdadmin21.fridaysperu.com/media/minibanner/Banner_Home_Mobile_Desktop.jpg"
              alt="Promo 6"
              className="block w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explora Nuestras Categorías
          </h2>
          <p className="text-lg text-gray-600">
            Descubre todos los sabores que tenemos para ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate('/menu')}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  {category.name}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center text-red-600 font-semibold group-hover:text-red-700">
                  <span>Ver productos</span>
                  <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
