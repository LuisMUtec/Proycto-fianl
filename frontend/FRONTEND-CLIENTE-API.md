# 🍔 API DOCUMENTATION - FRONTEND CLIENTE FRIDAYS PERÚ

**Fecha:** 29 de noviembre de 2025
**Versión:** 1.0

---

## 🔗 ENDPOINTS DE DESPLIEGUE

> **⚠️ IMPORTANTE**: Actualiza estas URLs después de cada despliegue del backend

### **URLs Actuales (Actualizado: 29/Nov/2025)**

```typescript
// src/config/api-endpoints.ts

export const API_ENDPOINTS = {
  // E-Commerce Service (Auth, Menu, Orders, Cart, Payments)
  ECOMMERCE: 'https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev',

  // Delivery Service (Tracking)
  DELIVERY: 'https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev',

  // WebSocket Service (Notificaciones en tiempo real)
  WEBSOCKET: 'wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev',
} as const;

// Para ambiente de desarrollo local (opcional)
export const API_ENDPOINTS_LOCAL = {
  ECOMMERCE: 'http://localhost:3001',
  DELIVERY: 'http://localhost:3003',
  WEBSOCKET: 'ws://localhost:3005',
} as const;

// Seleccionar ambiente
const isDevelopment = import.meta.env.MODE === 'development';
const useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';

export const ACTIVE_ENDPOINTS = (isDevelopment && useLocal)
  ? API_ENDPOINTS_LOCAL
  : API_ENDPOINTS;
```

### **📝 Cómo Actualizar URLs Después del Despliegue**

1. **Desplegar servicios del backend:**
   ```bash
   cd backend/services/ecommerce-service
   serverless deploy --stage dev
   # Copia el endpoint que aparece en la consola
   ```

2. **Actualizar en el código:**
   - Abre `src/config/api-endpoints.ts`
   - Reemplaza las URLs con las nuevas
   - Guarda y haz commit

3. **Actualizar variables de entorno:**
   ```bash
   # .env
   VITE_API_ECOMMERCE=https://NUEVA-URL.execute-api.us-east-1.amazonaws.com/dev
   VITE_API_DELIVERY=https://NUEVA-URL.execute-api.us-east-1.amazonaws.com/dev
   VITE_WS_URL=wss://NUEVA-URL.execute-api.us-east-1.amazonaws.com/dev
   ```

### **URLs Base por Servicio**

| Servicio | Endpoint Actual | Endpoints que Usa |
|----------|----------------|-------------------|
| **E-Commerce** | `https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev` | `/auth/*`, `/menu/*`, `/orders/*`, `/cart/*`, `/payments/*` |
| **Delivery** | `https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev` | `/delivery/orders/{orderId}/tracking` |
| **WebSocket** | `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev` | Conexión WebSocket con `?token=JWT` |

---

## 📋 TABLA DE CONTENIDOS

1. [Endpoints de Despliegue](#endpoints-de-despliegue)
2. [Assets de Diseño](#assets-de-diseño)
3. [Enrutamiento (React Router)](#enrutamiento-react-router)
4. [Información General](#información-general)
5. [Configuración Inicial](#configuración-inicial)
6. [Autenticación](#autenticación)
7. [Menú (Público)](#menú-público)
8. [Carrito](#carrito)
9. [Órdenes](#órdenes)
10. [Pagos](#pagos)
11. [Tracking](#tracking)
12. [WebSocket](#websocket)
13. [Manejo de Errores](#manejo-de-errores)
14. [Estados de Orden](#estados-de-orden)
15. [Roles y Permisos](#roles-y-permisos)
16. [Testing](#testing)
17. [Ejemplos Completos](#ejemplos-completos)

---

## 🎨 ASSETS DE DISEÑO

### **Logo e Iconos Principales**

```typescript
// src/config/assets.ts

export const BRAND_ASSETS = {
  // Logo Principal
  LOGO: 'https://fridaysperu.com/img/fridays/logo.svg',
  FOOTER_LOGO: 'https://fridaysperu.com/_next/image?url=%2Fimg%2Ffridays%2Ffooter-logo.png&w=3840&q=75',

  // Iconos
  WHATSAPP: 'https://fridaysperu.com/img/whatsapp_2.png',
  NEXT_ARROW: 'https://fridaysperu.com/img/malmenara_new/home/next-white.svg',
  BOOK_ICON: 'https://fridaysperu.com/_next/image?url=%2Fimg%2Ffridays%2Ficons%2Fbook-new.jpg&w=256&q=75',
} as const;

export const PAYMENT_METHODS = {
  VISA: 'https://fridaysperu.com/img/fridays/payment/visa.svg',
  MASTERCARD: 'https://fridaysperu.com/img/fridays/payment/mc.svg',
  AMEX: 'https://fridaysperu.com/img/fridays/payment/amex.svg',
  DINERS: 'https://fridaysperu.com/img/fridays/payment/diners.svg',
  YAPE: 'https://fridaysperu.com/img/fridays/payment/yape.svg',
} as const;
```

### **Banners e Imágenes Promocionales**

```typescript
// Hero/Carousel Banners
export const BANNER_IMAGES = {
  HERO_1: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Fadmin.fridaysperu.com%2Fapi%2Ffile_upload%2F26a0920a-f83e-470e-a4cb-b3e550956116.jpeg&w=3840&q=100',
  HERO_2: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Fadmin.fridaysperu.com%2Fapi%2Ffile_upload%2F3717a90b-a2fc-4bbf-a214-6ca31dad711d.jpeg&w=3840&q=100',
  HERO_3: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Fadmin.fridaysperu.com%2Fapi%2Ffile_upload%2F76063d66-f6fe-426e-b93b-9475b7e82bbf.jpeg&w=3840&q=100',

  PROMO_1: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F1e36e576-7591-40eb-9757-0431c4a6892d.jpg&w=3840&q=100',
  PROMO_2: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fb716b452-7522-49b3-a1f7-e89c40a91acf.jpg&w=3840&q=75',
  PROMO_3: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F2c70b522-0c42-41cc-b59a-cf601188ba6e.jpg&w=3840&q=75',
} as const;
```

### **Imágenes de Categorías**

```typescript
// Categorías del Menú
export const CATEGORY_IMAGES = {
  SMASH_BURGERS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F708ee26a-0d4c-4987-a854-1add4954bb9f.jpg&w=3840&q=100',

  WRAPS_COMBOS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Ff0415be0-890d-4ff6-9a4c-84ed5f75802f.jpg&w=3840&q=100',

  CHICKEN_MADNESS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F21c6fc0b-a544-41b9-90ea-3e489ed01397.jpg&w=3840&q=100',

  HAMBURGUESAS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F708ee26a-0d4c-4987-a854-1add4954bb9f.jpg&w=3840&q=100',

  PLATOS_FUERTES: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Ff47dfebb-bbb4-4140-a1d3-1f9643d1ff08.jpg&w=3840&q=100',

  COSTILLAS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F1f5bd679-4602-4da9-a368-836b01175995.jpg&w=3840&q=100',

  ACOMPAÑAMIENTOS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2F3b107301-0a11-46ba-86ff-7f1b5f74c281.jpg&w=3840&q=100',

  ENSALADAS_PASTAS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fd540c9ea-80cd-4879-97ec-e48147fe3d4a.jpg&w=3840&q=100',

  BEBIDAS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fda8b40e0-b943-4565-bfe7-cef0140a6f83.jpg&w=3840&q=100',
} as const;
```

### **Imágenes de Productos (Ejemplos)**

```typescript
// Productos Destacados - Smash Burgers
export const PRODUCT_IMAGES = {
  SMASH_CHEESEBURGER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_smash_cheeseburger_1104221_1717gSrZzWat_main.jpg&w=3840&q=75',
  SMASH_BBQ_BURGER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_smash_bbq_burger_1104223_1717nKfT0c5p_main.jpg&w=3840&q=75',
  SMASH_BACON_CHEESEBURGER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_smash_bacon_cheeseburger_1104222_1717VtSyaDKc_main.jpg&w=3840&q=75',
  SPICY_JALAPENO_SMASH: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_spicy_jalapeno_smash_1104030_1717neZpGlf0_main.jpg&w=3840&q=75',

  // Wraps
  BACON_CHEESE_WRAP: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_bacon___cheese_wrap_1717ct5g9wtt_main.jpg&w=3840&q=75',
  BUFFALO_WRAP: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_buffalo_wrap_1121003_1717tiYA5WsO_main.jpg&w=3840&q=75',
  TEX_MEX_WRAP: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_tex_mex_wrap_1121002_1717Ct9pl67U_main.jpg&w=3840&q=75',
  BBQ_WRAP: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_bbq_wrap_1121001_1717BdmyXmRm_main.jpg&w=3840&q=75',

  // Tacos & Burritos
  CRISPY_CHICKEN_TACOS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_crispy_chicken_tacos_ec_1120001_1717eFT5lUkD_main.jpg&w=3840&q=75',
  CHICKEN_BBQ_BURRITO: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_chicken_bbq_burrito_1107233_171782i4Aidc_main.jpg&w=3840&q=75',
  CHICKEN_BUFFALO_BURRITO: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_chicken_buffalo_burrito_1107234_1717zh9VlABC_main.jpg&w=3840&q=75',
  BEEF_BURRITO: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_beef_burrito_1107235_1717Me0onAs3_main.jpg&w=3840&q=75',

  // Platters
  SMASH_BURGER_PLATTER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_smash_burger_platter_1108213_1717Djeq30zR_main.jpg&w=3840&q=75',
  CHICKEN_MADNESS_PLATTER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_chicken_madness_platter_1120031_1717fxtWOMeN_main.jpg&w=3840&q=75',

  // Wings
  BBQ_WINGS_8: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_bbq_wings_8_1101204_1717PTlpRBbU_main.jpg&w=3840&q=75',
  BUFFALO_WINGS_8: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_buffalo_wings_8_1101200_1717rk7MREYm_main.jpg&w=3840&q=75',
  GLAZE_WINGS_8: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_glaze_wings_8_1101202_1717U41puYAF_main.jpg&w=3840&q=75',

  // Hamburguesas Clásicas
  FRIDAYS_BURGER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_fridays_burger_1104200_1717HF5qNAN8_main.jpg&w=3840&q=75',
  FRIDAYS_CHEESEBURGER: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_fridays_cheeseburguer_1104201_1717vsG6N4J1_main.jpg&w=3840&q=75',

  // Platos Fuertes
  CHICKEN_FINGERS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_chicken_fingers_1717364qVxQv_main.png&w=3840&q=75',
  WHISKEY_GLAZE_CHICKEN: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_fridays_whiskey_glaze_chicken_1105213_1717sbKByc6K_main.jpg&w=3840&q=75',
  CHICKEN_FAJITAS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_fridays_sizzling_chicken_fajitas_1107200_1717ulbOxtPB_main.jpg&w=3840&q=75',

  // Costillas
  WHISKEY_GLAZE_RIBS_HALF: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_whiskey_glaze_blaze_ribs_half_1105211_1717wp9nOBMd_main.jpg&w=3840&q=75',
  BBQ_BABY_BACK_RIBS: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_bbq_baby_back_ribs_1717Lyk7Nvrk_main.jpg&w=3840&q=75',

  // Ensaladas
  CHIPOTLE_YUCATAN_SALAD: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_chipotle_yucatan_salad_1120049_17173clqw5cA_main.jpg&w=3840&q=75',
  BBQ_CHICKEN_SALAD: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_bbq_chicken_salad_1120040_1717yaRtQ6Ep_main.jpg&w=3840&q=75',

  // Pastas
  FRIED_CHICKEN_PASTA: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_fried_chicken_pasta_1120057_1717Zo7ncQT5_main.png&w=3840&q=75',
  CAJUN_SHRIMP_CHICKEN_PASTA: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_cajun_shrimp___chicken_pasta_ec_1120063_1717mcxG5gUF_main.png&w=3840&q=75',

  // Acompañamientos
  COLESLAW: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_coleslaw_1114203_1717Nw7HotHH_main.jpg&w=3840&q=75',
  FREJOLES: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_frejoles_de_la_casa_1114202_1717P1wQb8i8_main.jpg&w=3840&q=75',
  GUACAMOLE: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_porcion_de_guacamole_1114206_1717cihBvsVH_main.jpg&w=3840&q=75',
  CHOCLO: 'https://fridaysperu.com/_next/image?url=https%3A%2F%2Ft2ks3pro.s3.amazonaws.com%2Fsku_choclo_americano_1114201_1717QTdNVQFB_main.jpg&w=3840&q=75',
} as const;
```

### **Placeholder para Lazy Loading**

```typescript
// Placeholder para carga diferida
export const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
```

### **Componente de Imagen Optimizada**

```typescript
// src/components/OptimizedImage.tsx
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  fallback = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  lazy = true
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src);
  const [loading, setLoading] = useState(lazy);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setImageSrc(fallback);
    setLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### **Ejemplo de Uso en Componentes**

```typescript
// Navbar con Logo
import { BRAND_ASSETS } from '@/config/assets';

export function Navbar() {
  return (
    <nav className="bg-black">
      <img
        src={BRAND_ASSETS.LOGO}
        alt="TGI Fridays"
        className="h-12"
      />
    </nav>
  );
}

// Hero Carousel
import { BANNER_IMAGES } from '@/config/assets';
import { OptimizedImage } from '@/components/OptimizedImage';

export function HeroCarousel() {
  const banners = [
    BANNER_IMAGES.HERO_1,
    BANNER_IMAGES.HERO_2,
    BANNER_IMAGES.HERO_3,
  ];

  return (
    <div className="carousel">
      {banners.map((banner, idx) => (
        <OptimizedImage
          key={idx}
          src={banner}
          alt={`Promoción ${idx + 1}`}
          className="w-full h-96"
        />
      ))}
    </div>
  );
}

// Product Card
import { PRODUCT_IMAGES } from '@/config/assets';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card">
      <OptimizedImage
        src={product.imageUrl || PRODUCT_IMAGES.SMASH_CHEESEBURGER}
        alt={product.name}
        className="w-full h-64"
      />
      <h3>{product.name}</h3>
      <p>S/ {product.price}</p>
    </div>
  );
}

// Footer con Métodos de Pago
import { PAYMENT_METHODS } from '@/config/assets';

export function Footer() {
  return (
    <footer className="bg-black text-white p-8">
      <div className="flex gap-4">
        {Object.entries(PAYMENT_METHODS).map(([key, url]) => (
          <img
            key={key}
            src={url}
            alt={key}
            className="h-8"
          />
        ))}
      </div>
    </footer>
  );
}
```

### **Consideraciones de Diseño**

1. **Colores de Marca:**
   - Rojo Principal: `#E32428` (Red Fridays)
   - Negro: `#000000`
   - Blanco: `#FFFFFF`
   - Gris: `#666666`

2. **Tipografía:**
   - Fuente Principal: `Inter` o `Helvetica Neue`
   - Peso: 400 (Regular), 600 (SemiBold), 700 (Bold)

3. **Optimización de Imágenes:**
   - Usar lazy loading para productos
   - Implementar placeholder mientras carga
   - Manejo de errores con imagen fallback
   - Responsive con `srcset` si es necesario

4. **Accesibilidad:**
   - Siempre incluir `alt` descriptivo
   - Contraste adecuado para texto sobre imágenes
   - Tamaños de toque mínimos (44x44px)

---

## 📸 CAPTURAS DE PANTALLA DEL FLUJO DE USUARIO

### **1. Autenticación**

#### Login Page
![Login](https://i.imgur.com/login-fridays.png)
- **Elementos:**
  - Logo centrado con rayas rojas y blancas
  - Título "BIENVENIDO"
  - Campo de email ("Correo electrónico*")
  - Campo de password ("Contraseña*") con icono de mostrar/ocultar
  - Link "¿Olvidaste tu contraseña?"
  - Botón rojo "Ingresar"
  - Link "¿No tienes una cuenta? **Únete ahora**" (texto rojo)
  - Divider "O continuar con el correo electrónico"
- **Colores:**
  - Fondo: Blanco `#FFFFFF`
  - Botón: Rojo `#E32428`
  - Links: Rojo `#E32428`
  - Inputs: Borde gris claro

---

### **2. Navegación Principal**

#### Navbar con Selector de Ubicación
![Navbar](https://i.imgur.com/navbar-fridays.png)
- **Elementos:**
  - Icono de ubicación + Texto "¿Cómo deseas recibir tu pedido?"
  - Logo TGI FRIDAYS centrado
  - Call Center: "(01) 644 9099" (texto rojo)
  - Botón "INGRESA" con icono de usuario
  - Icono de carrito de compras
  - Menu horizontal: CARTA | LOCALES | RESERVA

#### Menú de Categorías
![Menu Categories](https://i.imgur.com/menu-categories.png)
- **Categorías:**
  - Promociones (activo - texto rojo, underline)
  - Platters & Boxes
  - Appetizers
  - Burritos
  - Burgers & Sandwich
  - Chicken
  - Ribs
  - Guarniciones
  - Bebidas
  - Postres
- **Estilo:**
  - Fondo blanco con sombra sutil
  - Categoría activa: Texto rojo + underline rojo
  - Hover: Cambio de color a gris oscuro

---

### **3. Hero/Carousel de Promociones**

#### Banner Black Fridays
![Hero Banner](https://i.imgur.com/hero-banner.png)
- **Elementos:**
  - Texto "BLACK FRIDAYS" en neón rojo
  - "DEL 28 DE NOV AL 07 DE DIC"
  - Imagen de laptop con tacos y bebida
  - Badge circular "41% DCTO" (rojo brillante)
  - Precio "25.90 SOLES"
  - "CRISPY CHICKEN TACOS + 1 BEBIDA"
  - "EXCLUSIVO EN: FRIDAYSPERU.COM | (01) 644-9099"
  - "DELIVERY GRATIS CON EL CUPÓN >DELIVERYCERO"
- **Botones de navegación:** Flechas izquierda/derecha
- **Indicadores:** Dots para navegación (3 puntos)
- **Botón flotante WhatsApp:** Verde en esquina inferior derecha

---

### **4. Páginas de Categorías**

#### Promociones - Black Fridays
![Promociones](https://i.imgur.com/promociones.png)
- **Banner de categoría:** Full width con texto repetido "PROMOCIONES"
- **Grid de productos:** 2 columnas
- **Card de producto:**
  - Badge "-41%" en esquina superior izquierda
  - Imagen del producto (laptop con comida)
  - Título: "BLACK FRIDAYS: CRISPY CHICKEN TACO + BEBIDA"
  - Sin precio visible (promo)
  - Diseño: Fondo oscuro con neón rojo "BLACK FRIDAYS"

#### Platters & Boxes
![Platters](https://i.imgur.com/platters.png)
- **Banner:** Texto "PLATTERS & BOXES" repetido con imagen de chicken fingers
- **Grid:** 4 columnas (responsive)
- **Cards con:**
  - Imagen del producto
  - Nombre: "CHICKEN FINGER BOX"
  - Precio: "S/ 49.90"
  - Botón rojo "ORDENAR"
  - Disclaimer: "Imagen y presentación referencial"

#### Postres
![Postres](https://i.imgur.com/postres.png)
- **Banner:** Hero con postre (brownie con helado)
- **Grid:** 4 columnas
- **Productos:**
  - "COOKIES AND CREAM BROWNIE" - S/ 14.90
  - "BROWNIE OBSESSION" - S/ 25.00
  - "APPLE JACK CRUMBLE" - S/ 25.00
  - "DOUBLE BERRY JACK CRUMBLE" - S/ 25.00

#### Bebidas
![Bebidas](https://i.imgur.com/bebidas.png)
- **Banner:** 4 vasos de bebidas coloridas
- **Sección:** "Bebidas sin alcohol"
- **Grid:** 5 columnas
- **Productos con imágenes reales:**
  - Chicha morada (vaso)
  - San Luis Sin Gas 750ml
  - San Luis Con Gas 625ml
  - Inca Kola 500ml

---

### **5. Detalle de Producto**

#### Product Detail Page
![Product Detail](https://i.imgur.com/product-detail.png)
- **Layout:** 2 columnas (imagen izquierda, info derecha)
- **Elementos:**
  - Breadcrumb: "< Regresar"
  - Imagen grande del producto (vaso de chicha)
  - Nombre: "CHICHA"
  - Precio: "S/ 6.00"
  - Cantidad: Botones - / + con input numérico (valor: 1)
  - Botón rojo grande: "Agregar a tu pedido S/6.00"
  - Disclaimer: "Imagen y presentación referencial"

---

### **6. Locales y Delivery**

#### Página de Locales
![Locales](https://i.imgur.com/locales.png)
- **Título:** "Nuestros locales"
- **Subtítulo:** "Ubica tu Fridays más cercano"
- **Mapa:** Google Maps embebido con markers verdes
- **Lista de locales:**
  - Fridays Óvalo Gutiérrez
  - Dirección: "Av. Sta. Cruz 824 Miraflores, Perú"
  - Estado: "● Abierto - Cierra: 11:30 pm" (punto verde)
  - Botón: "Más información"

#### Modal Selector de Recojo/Delivery
![Modal Delivery](https://i.imgur.com/modal-delivery.png)
- **Título:** "¿Cómo deseas recibir tu pedido?"
- **Tabs:**
  - "RECOJO EN TIENDA" (outline, no seleccionado)
  - "DELIVERY" (rojo sólido, seleccionado)
- **Input de dirección:**
  - Placeholder: "Escribe la dirección de entrega"
  - Icono de ubicación roja
- **Autocomplete:** Dropdown con sugerencias de direcciones
- **Mapa interactivo:** Muestra pin rojo en dirección seleccionada
- **Texto:** "Jirón Ricardo Palma 525, Villa María del Triunfo 15809, Perú"
- **Advertencia:** "No se encontraron tiendas disponibles para esta ubicación"
- **Botón rojo:** "CONFIRMAR DIRECCIÓN"

#### Modal Selector de Tienda (Recojo)
![Modal Recojo](https://i.imgur.com/modal-recojo.png)
- **Lista de tiendas disponibles:**
  - Número + Nombre
  - Dirección completa
  - Checkmark verde si está seleccionada
  - Iconos: Salón, Rappi, Pedidos Ya, Web y Recojo en tienda
  - Tiempo estimado: "25 - 30 min aprox." (con icono de reloj rojo)
- **Grid:** 2 columnas, cards con borde
- **Tienda seleccionada:** Resaltada con info adicional
  - Teléfono: "123456789"
  - Botón rojo grande: "Confirmar"
  - Disclaimer: "El menú de la tienda, las ofertas especiales..."

#### Página Principal con Reservas
![Reservas](https://i.imgur.com/reservas-page.png)
- **Hero:** Imagen de fondo con costillas y bacon
- **Título grande:** "Fridays"
- **Botón blanco:** "Reservas"
- **Selector de local:** Dropdown con 6+ locales
  - Fridays - Jockey Plaza
  - Fridays - La Rambla
  - Fridays - Larcomar
  - Fridays - Mall del Sur
  - Fridays - Mall Plaza Comas
  - Fridays - Open Plaza La Marina

---

### **7. Carrito de Compras**

#### Vista de Carrito (Sidebar)
![Cart Sidebar](https://i.imgur.com/cart-sidebar.png)
- **Header rojo:** "RECOJO EN: Av. Sta. Cruz 824 Miraflores, Perú" (con X para cerrar)
- **Item del carrito:**
  - Imagen pequeña del producto
  - Nombre: "BLACK FRIDAYS: CRISPY CHICKEN TACO + BEBIDA"
  - Descripción breve
  - Precio: "S/25.90"
  - Cantidad: "1"
  - Botones: "MODIFICAR" (rojo outline) | "ELIMINAR" (rojo text)
- **Resumen:**
  - Subtotal: S/ 25.90
  - Delivery: S/ 0.00
  - Total a pagar: S/ 25.90
- **Botones:**
  - "REALIZAR COMPRA" (rojo sólido)
  - "SEGUIR COMPRANDO" (texto rojo)

---

### **8. Elementos UI Comunes**

#### WhatsApp Flotante
- **Posición:** Fixed, bottom-right
- **Color:** Verde WhatsApp `#25D366`
- **Icono:** Logo WhatsApp blanco
- **Badge:** "ESCRÍBENOS" o "TAMBIÉN PUEDES"
- **Efecto:** Pulse animation

#### Botón Scroll to Top
- **Posición:** Fixed, bottom-right (arriba del WhatsApp)
- **Color:** Rojo `#E32428`
- **Icono:** Flecha hacia arriba
- **Forma:** Círculo

#### Loading States
- **Skeleton:** Fondo gris claro `#F3F4F6` con animación pulse
- **Spinner:** Circular, color rojo, 16px de alto

---

### **Guía de Implementación por Página**

```typescript
// Estructura de rutas basada en capturas
const routes = [
  '/auth/login',                    // Login page
  '/',                              // Home con hero carousel
  '/carta?category=promociones',    // Promociones
  '/carta?category=plattersboxes',  // Platters & Boxes
  '/carta?category=postres',        // Postres
  '/carta/chicha',                  // Detalle de producto
  '/locations',                     // Locales y mapa
  '/reserva',                       // Reservas (externa)
  '/cart',                          // Carrito (sidebar)
];

// Modales
const modals = [
  'DeliveryModal',      // Selector recojo/delivery
  'StorePickupModal',   // Selector de tienda
  'AddressModal',       // Autocomplete de dirección
];
```

---

## 🛣️ ENRUTAMIENTO (REACT ROUTER)

### **Estructura de Rutas Completa**

```typescript
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Pages
import { HomePage } from '../pages/HomePage';
import { MenuPage } from '../pages/MenuPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'menu',
        element: <MenuPage />,
      },
      {
        path: 'menu/:category',
        element: <MenuPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
### **Variables de Entorno (.env)**

```bash
# API Gateway URLs - ACTUALIZAR DESPUÉS DE CADA DESPLIEGUE
VITE_API_ECOMMERCE=https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev
VITE_API_DELIVERY=https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev

# Para desarrollo local (opcional)
VITE_USE_LOCAL_API=false
VITE_API_ECOMMERCE_LOCAL=http://localhost:3001
VITE_API_DELIVERY_LOCAL=http://localhost:3003
VITE_WS_URL_LOCAL=ws://localhost:3005

# Configuración
VITE_APP_NAME=Fridays Perú
VITE_DELIVERY_FEE=5.00
VITE_ENV=development
```   {
        path: 'profile',
### **Configuración de Endpoints**

```typescript
// src/config/api-endpoints.ts
const isDevelopment = import.meta.env.MODE === 'development';
const useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';

export const API_ENDPOINTS = {
  ECOMMERCE: useLocal && isDevelopment
    ? import.meta.env.VITE_API_ECOMMERCE_LOCAL
    : import.meta.env.VITE_API_ECOMMERCE,

  DELIVERY: useLocal && isDevelopment
    ? import.meta.env.VITE_API_DELIVERY_LOCAL
    : import.meta.env.VITE_API_DELIVERY,

  WEBSOCKET: useLocal && isDevelopment
    ? import.meta.env.VITE_WS_URL_LOCAL
    : import.meta.env.VITE_WS_URL,
} as const;

// Validar que las URLs estén configuradas
Object.entries(API_ENDPOINTS).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`❌ Falta configurar VITE_API_${key} en .env`);
  }
});

export default API_ENDPOINTS;
```

### **Cliente API Base (Recomendado)**

```typescript
// src/lib/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import API_ENDPOINTS from '../config/api-endpoints';

const API_BASE_URL = API_ENDPOINTS.ECOMMERCE;
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// App.tsx
export function App() {
  return <RouterProvider router={router} />;
}
```

### **Componente ProtectedRoute**

```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!user) {
    // Guardar la ruta que intentaba acceder para redirigir después del login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### **Layout Principal**

```typescript
// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### **Navbar con Navegación**

```typescript
// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Home, Menu, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors"
          >
            TGI FRIDAYS
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Home size={20} />
              <span>Inicio</span>
            </Link>

            <Link
              to="/menu"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} />
              <span>Menú</span>
            </Link>

            {user && (
              <Link
                to="/orders"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Package size={20} />
                <span>Mis Órdenes</span>
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <User size={20} />
                    <span className="text-sm">{user.firstName}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### **Navegación Programática**

```typescript
// Desde cualquier componente
import { useNavigate } from 'react-router-dom';

function CheckoutPage() {
  const navigate = useNavigate();

  const handleOrderSuccess = (orderId: string) => {
    // Redirigir al tracking
    navigate(`/orders/${orderId}/tracking`);
  };

  const handleCancel = () => {
    // Volver atrás
    navigate(-1);
  };

  return (
    // ...
  );
}
```

### **Parámetros de Ruta**

```typescript
// Leer parámetros de la URL
import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();

  useEffect(() => {
    loadProduct(productId!);
  }, [productId]);
}

function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();

  useEffect(() => {
    loadOrderTracking(orderId!);
  }, [orderId]);
}
```

### **Query Parameters**

```typescript
// Leer query params (?category=hamburguesas&page=2)
import { useSearchParams } from 'react-router-dom';

function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category');
  const page = searchParams.get('page') || '1';

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({ category: newCategory, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...(category && { category }),
      page: newPage.toString()
    });
  };
}
```

### **Breadcrumbs**

```typescript
// src/components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const routeNames: Record<string, string> = {
  '': 'Inicio',
  menu: 'Menú',
  cart: 'Carrito',
  checkout: 'Checkout',
  orders: 'Mis Órdenes',
  profile: 'Perfil',
  tracking: 'Seguimiento',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link to="/" className="hover:text-red-600">
        Inicio
      </Link>
      {pathnames.map((path, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[path] || path;

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight size={16} />
            {isLast ? (
              <span className="text-gray-900 font-medium">{name}</span>
            ) : (
              <Link to={to} className="hover:text-red-600">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

### **Redirección después del Login**

```typescript
// src/pages/auth/LoginPage.tsx
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });

      // Redirigir a la página que intentaba acceder o a home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      // Manejar error
    }
  };
}
```

### **Instalación**

```bash
npm install react-router-dom
```

```json
// package.json
{
  "dependencies": {
    "react-router-dom": "^6.20.0"
  }
}
```

---

## 📖 INFORMACIÓN GENERAL

## 📖 INFORMACIÓN GENERAL

### **Arquitectura del Sistema**

El backend de Fridays Perú está construido con arquitectura serverless en AWS:

```
Frontend (Cliente)
    ↓
API Gateway HTTP
    ↓
Lambda Functions
    ↓
DynamoDB
```

**Componentes clave:**
- **API Gateway**: Endpoint único para todas las peticiones HTTP
- **Lambda**: Funciones serverless que procesan las peticiones
- **DynamoDB**: Base de datos NoSQL para persistencia
- **EventBridge**: Sistema de eventos para comunicación entre servicios
- **Step Functions**: Orquestación del flujo de órdenes
- **WebSocket API**: Notificaciones en tiempo real

### **Flujo de una Orden**

```
1. Cliente → POST /orders (crea orden + pago simulado)
2. Backend → Guarda en DynamoDB
3. Backend → Step Function procesa orden
4. EventBridge → Dispara eventos
5. WebSocket → Notifica cambios al cliente
6. Cocina → Prepara orden
7. Delivery → Entrega orden
```

### **URLs del Sistema**

| Servicio | URL Base |
|----------|----------|
| **E-Commerce** | `https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev` |
| **Kitchen** | `https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev` |
| **Delivery** | `https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev` |
| **Admin** | `https://6gce47hxc2.execute-api.us-east-1.amazonaws.com/dev` |
| **WebSocket** | `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev` |

**⚠️ IMPORTANTE**: El frontend de CLIENTE solo necesita las URLs de **E-Commerce**, **Delivery** (tracking) y **WebSocket**.

### **Consideraciones Importantes**

#### **1. Sistema de Pagos**
- ✅ **SIMULADO** - No procesa dinero real
- ✅ Incluido automáticamente en `POST /orders`
- ✅ 95% éxito, 5% rechazo (para testing)
- ❌ NO requiere tarjeta de crédito
- ❌ NO integra con Stripe/PayPal

#### **2. Autenticación**
- ✅ JWT almacenado en `localStorage`
- ✅ Token expira en 24 horas
- ✅ Refresh token disponible
- ✅ Header: `Authorization: Bearer {token}`

#### **3. CORS**
- ✅ CORS habilitado en todos los endpoints
- ✅ Permite peticiones desde cualquier origen
- ✅ Headers `Content-Type: application/json` requeridos

#### **4. Rate Limiting**
- ⚠️ AWS API Gateway: 10,000 requests/segundo
- ⚠️ WebSocket: 1,000 conexiones simultáneas

---

## ⚙️ CONFIGURACIÓN INICIAL

### **Variables de Entorno (.env)**

```bash
# API Gateway URLs
VITE_API_BASE_URL=https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev

# Configuración
VITE_APP_NAME=Fridays Perú
VITE_DELIVERY_FEE=5.00
```

### **Instalación de Dependencias**

```bash
npm install axios react-router-dom
# o
npm install @tanstack/react-query axios react-router-dom
```

### **Cliente API Base (Recomendado)**

```typescript
// src/lib/api-client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper para peticiones
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    throw error;
  }
};
```

---

## 🔐 AUTENTICACIÓN

### **1. Registro de Cliente**

**Endpoint:** `POST /auth/register`
**Autenticación:** No requiere
**Descripción:** Crea una nueva cuenta de cliente

**Request Body:**
```json
{
  "email": "cliente@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phoneNumber": "+51999999999",
  "address": "Av. Principal 123, Lima"
}
```

**Response Success (200):**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "cliente@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phoneNumber": "+51999999999",
    "address": "Av. Principal 123, Lima",
    "role": "Cliente",
    "status": "ACTIVE",
    "createdAt": "2025-11-29T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400):**
```json
{
  "error": "El email ya está registrado",
  "statusCode": 400
}
```

**Ejemplo TypeScript:**
```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}

interface AuthResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    address: string | null;
    role: string;
    status: string;
    createdAt: string;
  };
  token: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>({
    method: 'POST',
    url: '/auth/register',
    data,
  });
};
```

---

### **2. Iniciar Sesión**

**Endpoint:** `POST /auth/login`
**Autenticación:** No requiere
**Descripción:** Inicia sesión y obtiene token JWT

**Request Body:**
```json
{
  "email": "cliente@example.com",
  "password": "Password123!"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "cliente@example.com",
  "role": "Cliente",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response Error (401):**
```json
{
  "error": "Email o contraseña incorrectos",
  "statusCode": 401
}
```

**Ejemplo TypeScript:**
```typescript
interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiRequest<LoginResponse>({
    method: 'POST',
    url: '/auth/login',
    data,
  });

  // Guardar token en localStorage
  localStorage.setItem('token', response.token);
  localStorage.setItem('userId', response.userId);

  return response;
};
```

---

### **3. Renovar Token**

**Endpoint:** `POST /auth/refresh-token`
**Autenticación:** Bearer Token (token viejo)
**Descripción:** Renueva el token JWT antes de que expire

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token renovado exitosamente"
}
```

**Ejemplo TypeScript:**
```typescript
export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await apiRequest<{ token: string }>({
    method: 'POST',
    url: '/auth/refresh-token',
  });

  localStorage.setItem('token', response.token);
  return response;
};
```

---

### **4. Cerrar Sesión**

**Endpoint:** `POST /auth/logout`
**Autenticación:** Bearer Token
**Descripción:** Invalida el token actual

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Ejemplo TypeScript:**
```typescript
export const logout = async (): Promise<void> => {
  await apiRequest({
    method: 'POST',
    url: '/auth/logout',
  });

  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};
```

---

## 🍕 MENÚ (PÚBLICO)

### **1. Listar Todos los Productos**

**Endpoint:** `GET /menu?page=1&limit=20`
**Autenticación:** No requiere (público)
**Descripción:** Obtiene el catálogo completo de productos

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20)

**Response Success (200):**
```json
{
  "products": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "description": "Hamburguesa 100% carne de res con lechuga, tomate, cebolla y nuestra salsa especial",
      "price": 25.50,
      "category": "hamburguesas",
      "imageUrl": "https://s3.amazonaws.com/fridays-images/hamburguesa-classic.jpg",
      "available": true,
      "preparationTime": 15,
      "calories": 650,
      "ingredients": ["carne de res", "lechuga", "tomate", "cebolla", "pan brioche"],
      "allergens": ["gluten", "lácteos"],
      "isVegetarian": false,
      "isVegan": false,
      "spicyLevel": 0
    },
    {
      "productId": "prod_002",
      "name": "Coca Cola 500ml",
      "description": "Bebida gaseosa refrescante",
      "price": 5.00,
      "category": "bebidas",
      "imageUrl": "https://s3.amazonaws.com/fridays-images/coca-cola.jpg",
      "available": true,
      "preparationTime": 1,
      "calories": 210
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 52,
    "itemsPerPage": 20
  }
}
```

**Ejemplo TypeScript:**
```typescript
interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  preparationTime: number;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  spicyLevel?: number;
}

interface MenuResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const getMenu = async (page = 1, limit = 20): Promise<MenuResponse> => {
  return apiRequest<MenuResponse>({
    method: 'GET',
    url: '/menu',
    params: { page, limit },
  });
};
```

---

### **2. Filtrar por Categoría**

**Endpoint:** `GET /menu/{category}`
**Autenticación:** No requiere
**Descripción:** Obtiene productos de una categoría específica

**Categorías Disponibles:**
- `hamburguesas`
- `entradas`
- `acompañamientos`
- `bebidas`
- `postres`

**Response Success (200):**
```json
{
  "category": "hamburguesas",
  "products": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "price": 25.50,
      "imageUrl": "...",
      "available": true
    }
  ]
}
```

**Ejemplo TypeScript:**
```typescript
type Category = 'hamburguesas' | 'entradas' | 'acompañamientos' | 'bebidas' | 'postres';

export const getProductsByCategory = async (category: Category): Promise<MenuResponse> => {
  return apiRequest<MenuResponse>({
    method: 'GET',
    url: `/menu/${category}`,
  });
};
```

---

### **3. Ver Detalle de Producto**

**Endpoint:** `GET /menu/items/{itemId}`
**Autenticación:** No requiere
**Descripción:** Obtiene información detallada de un producto

**Response Success (200):**
```json
{
  "productId": "prod_001",
  "name": "Hamburguesa Classic",
  "description": "Hamburguesa 100% carne de res con lechuga, tomate, cebolla y nuestra salsa especial",
  "price": 25.50,
  "category": "hamburguesas",
  "imageUrl": "https://s3.amazonaws.com/fridays-images/hamburguesa-classic.jpg",
  "images": [
    "https://s3.amazonaws.com/fridays-images/hamburguesa-classic-1.jpg",
    "https://s3.amazonaws.com/fridays-images/hamburguesa-classic-2.jpg"
  ],
  "available": true,
  "preparationTime": 15,
  "calories": 650,
  "protein": 35,
  "carbs": 45,
  "fat": 28,
  "ingredients": ["carne de res 150g", "lechuga", "tomate", "cebolla", "pan brioche", "salsa especial"],
  "allergens": ["gluten", "lácteos"],
  "customizations": [
    {
      "name": "Sin cebolla",
      "priceModifier": 0
    },
    {
      "name": "Extra queso",
      "priceModifier": 3.00
    }
  ],
  "reviews": {
    "rating": 4.7,
    "count": 324
  }
}
```

**Ejemplo TypeScript:**
```typescript
export const getProductDetail = async (productId: string): Promise<Product> => {
  return apiRequest<Product>({
    method: 'GET',
    url: `/menu/items/${productId}`,
  });
};
```

---

### **4. Buscar Productos**

**Endpoint:** `GET /menu/search?q=hamburguesa`
**Autenticación:** No requiere
**Descripción:** Busca productos por nombre o descripción

**Query Parameters:**
- `q` (requerido): Término de búsqueda

**Response Success (200):**
```json
{
  "query": "hamburguesa",
  "results": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "description": "...",
      "price": 25.50,
      "category": "hamburguesas",
      "imageUrl": "...",
      "available": true
    }
  ],
  "count": 8
}
```

**Ejemplo TypeScript:**
```typescript
interface SearchResponse {
  query: string;
  results: Product[];
  count: number;
}

export const searchProducts = async (query: string): Promise<SearchResponse> => {
  return apiRequest<SearchResponse>({
    method: 'GET',
    url: '/menu/search',
    params: { q: query },
  });
};
```

---

### **5. Listar Categorías**

**Endpoint:** `GET /menu/categories`
**Autenticación:** No requiere
**Descripción:** Obtiene todas las categorías disponibles

**Response Success (200):**
```json
{
  "categories": [
    {
      "id": "hamburguesas",
      "name": "Hamburguesas",
      "description": "Nuestras legendarias hamburguesas",
      "imageUrl": "https://s3.amazonaws.com/fridays-images/cat-hamburguesas.jpg",
      "productCount": 12
    },
    {
      "id": "bebidas",
      "name": "Bebidas",
      "description": "Refrescos y bebidas especiales",
      "imageUrl": "https://s3.amazonaws.com/fridays-images/cat-bebidas.jpg",
      "productCount": 15
    }
  ]
}
```

**Ejemplo TypeScript:**
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export const getCategories = async (): Promise<{ categories: Category[] }> => {
  return apiRequest<{ categories: Category[] }>({
    method: 'GET',
    url: '/menu/categories',
  });
};
```

---

## 🛒 CARRITO

### **1. Sincronizar Carrito**

**Endpoint:** `POST /cart/sync`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Agrega o actualiza items en el carrito

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "customizations": [
        {
          "name": "Sin cebolla",
          "priceModifier": 0
        },
        {
          "name": "Extra queso",
          "priceModifier": 3.00
        }
      ],
      "notes": "Término medio por favor"
    },
    {
      "productId": "prod_002",
      "quantity": 1
    }
  ]
}
```

**Response Success (200):**
```json
{
  "cart": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "cartItemId": "cart_item_001",
        "productId": "prod_001",
        "name": "Hamburguesa Classic",
        "price": 25.50,
        "quantity": 2,
        "imageUrl": "...",
        "customizations": [
          {
            "name": "Sin cebolla",
            "priceModifier": 0
          },
          {
            "name": "Extra queso",
            "priceModifier": 3.00
          }
        ],
        "notes": "Término medio por favor",
        "subtotal": 57.00
      },
      {
        "cartItemId": "cart_item_002",
        "productId": "prod_002",
        "name": "Coca Cola 500ml",
        "price": 5.00,
        "quantity": 1,
        "imageUrl": "...",
        "subtotal": 5.00
      }
    ],
    "subtotal": 62.00,
    "itemCount": 3,
    "updatedAt": "2025-11-29T10:30:00.000Z"
  }
}
```

**Ejemplo TypeScript:**
```typescript
interface CartItem {
  productId: string;
  quantity: number;
  customizations?: {
    name: string;
    priceModifier: number;
  }[];
  notes?: string;
}

interface Cart {
  userId: string;
  items: Array<{
    cartItemId: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    customizations?: Array<{ name: string; priceModifier: number }>;
    notes?: string;
    subtotal: number;
  }>;
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

export const syncCart = async (items: CartItem[]): Promise<{ cart: Cart }> => {
  return apiRequest<{ cart: Cart }>({
    method: 'POST',
    url: '/cart/sync',
    data: { items },
  });
};
```

---

### **2. Vaciar Carrito**

**Endpoint:** `DELETE /cart`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Elimina todos los items del carrito

**Response Success (200):**
```json
{
  "message": "Carrito vaciado exitosamente"
}
```

**Ejemplo TypeScript:**
```typescript
export const clearCart = async (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>({
    method: 'DELETE',
    url: '/cart',
  });
};
```

---

## 📦 ÓRDENES

### **1. Crear Orden (Checkout)**

**Endpoint:** `POST /orders`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Crea una nueva orden desde el carrito. **INCLUYE PAGO AUTOMÁTICO SIMULADO**

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "price": 25.50,
      "customizations": [
        {
          "name": "Extra queso",
          "priceModifier": 3.00
        }
      ],
      "notes": "Término medio"
    },
    {
      "productId": "prod_002",
      "quantity": 1,
      "price": 5.00
    }
  ],
  "deliveryAddress": {
    "street": "Av. Siempre Viva",
    "number": "123",
    "district": "San Isidro",
    "city": "Lima",
    "reference": "Casa color azul, segunda puerta",
    "coordinates": {
      "lat": -12.0464,
      "lng": -77.0428
    }
  },
  "paymentMethod": "CARD",
  "notes": "Tocar el timbre 2 veces"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Orden creada y pago procesado exitosamente",
  "data": {
    "order": {
      "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
      "orderNumber": "ORD-2025-1129-001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "CREATED",
      "items": [
        {
          "productId": "prod_001",
          "name": "Hamburguesa Classic",
          "quantity": 2,
          "price": 25.50,
          "customizations": [
            {
              "name": "Extra queso",
              "priceModifier": 3.00
            }
          ],
          "notes": "Término medio",
          "subtotal": 57.00
        },
        {
          "productId": "prod_002",
          "name": "Coca Cola 500ml",
          "quantity": 1,
          "price": 5.00,
          "subtotal": 5.00
        }
      ],
      "subtotal": 62.00,
      "deliveryFee": 5.00,
      "total": 67.00,
      "currency": "PEN",
      "deliveryAddress": {
        "street": "Av. Siempre Viva",
        "number": "123",
        "district": "San Isidro",
        "city": "Lima",
        "reference": "Casa color azul, segunda puerta",
        "coordinates": {
          "lat": -12.0464,
          "lng": -77.0428
        }
      },
      "customerInfo": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "phoneNumber": "+51999999999",
        "email": "cliente@example.com"
      },
      "paymentMethod": "CARD",
      "paymentStatus": "COMPLETED",
      "paymentDetails": {
        "transactionId": "TXN#ABC12345",
        "processedAt": "2025-11-29T10:35:00.000Z"
      },
      "notes": "Tocar el timbre 2 veces",
      "estimatedDeliveryTime": "2025-11-29T11:20:00.000Z",
      "createdAt": "2025-11-29T10:35:00.000Z",
      "updatedAt": "2025-11-29T10:35:00.000Z"
    },
    "payment": {
      "status": "COMPLETED",
      "transactionId": "TXN#ABC12345",
      "amount": 67.00,
      "currency": "PEN"
    }
  }
}
```

**Response Error - Pago Rechazado (402):**
```json
{
  "success": false,
  "error": "Pago rechazado - Intente nuevamente",
  "code": "PAYMENT_FAILED"
}
```

**⚠️ IMPORTANTE:**
- El pago se procesa **automáticamente** al crear la orden
- 95% de probabilidad de éxito, 5% de rechazo (simulado)
- Si el pago falla, la orden NO se crea
- El carrito se vacía automáticamente después del pago exitoso

**Ejemplo TypeScript:**
```typescript
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  customizations?: Array<{ name: string; priceModifier: number }>;
  notes?: string;
}

interface DeliveryAddress {
  street: string;
  number: string;
  district: string;
  city: string;
  reference?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface CreateOrderRequest {
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'CARD' | 'CASH';
  notes?: string;
}

interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: string;
  items: Array<any>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress: DeliveryAddress;
  customerInfo: any;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails: any;
  notes: string | null;
  estimatedDeliveryTime: string;
  createdAt: string;
  updatedAt: string;
}

export const createOrder = async (data: CreateOrderRequest): Promise<{
  success: boolean;
  message: string;
  data: {
    order: Order;
    payment: {
      status: string;
      transactionId: string;
      amount: number;
      currency: string;
    };
  };
}> => {
  return apiRequest({
    method: 'POST',
    url: '/orders',
    data,
  });
};
```

---

### **2. Ver Mis Órdenes**

**Endpoint:** `GET /users/orders`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Lista todas las órdenes del usuario

**Response Success (200):**
```json
{
  "orders": [
    {
      "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
      "orderNumber": "ORD-2025-1129-001",
      "status": "DELIVERED",
      "total": 67.00,
      "currency": "PEN",
      "itemCount": 3,
      "createdAt": "2025-11-29T10:35:00.000Z",
      "deliveredAt": "2025-11-29T11:15:00.000Z"
    },
    {
      "orderId": "ORDER#660e8400-e29b-41d4-a716-446655440001",
      "orderNumber": "ORD-2025-1128-045",
      "status": "IN_TRANSIT",
      "total": 42.50,
      "currency": "PEN",
      "itemCount": 2,
      "createdAt": "2025-11-28T19:20:00.000Z",
      "estimatedDeliveryTime": "2025-11-28T20:10:00.000Z"
    }
  ]
}
```

**Ejemplo TypeScript:**
```typescript
interface OrderSummary {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  deliveredAt?: string;
  estimatedDeliveryTime?: string;
}

export const getMyOrders = async (): Promise<{ orders: OrderSummary[] }> => {
  return apiRequest<{ orders: OrderSummary[] }>({
    method: 'GET',
    url: '/users/orders',
  });
};
```

---

### **3. Ver Detalle de Orden**

**Endpoint:** `GET /orders/{orderId}`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Obtiene detalles completos de una orden específica

**Response Success (200):**
```json
{
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-2025-1129-001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "IN_TRANSIT",
  "items": [
    {
      "productId": "prod_001",
      "name": "Hamburguesa Classic",
      "quantity": 2,
      "price": 25.50,
      "imageUrl": "...",
      "customizations": [
        { "name": "Extra queso", "priceModifier": 3.00 }
      ],
      "subtotal": 57.00
    }
  ],
  "subtotal": 62.00,
  "deliveryFee": 5.00,
  "total": 67.00,
  "currency": "PEN",
  "deliveryAddress": {
    "street": "Av. Siempre Viva",
    "number": "123",
    "district": "San Isidro",
    "city": "Lima",
    "reference": "Casa color azul",
    "coordinates": {
      "lat": -12.0464,
      "lng": -77.0428
    }
  },
  "customerInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "phoneNumber": "+51999999999",
    "email": "cliente@example.com"
  },
  "paymentMethod": "CARD",
  "paymentStatus": "COMPLETED",
  "paymentDetails": {
    "transactionId": "TXN#ABC12345",
    "processedAt": "2025-11-29T10:35:00.000Z"
  },
  "timeline": [
    {
      "status": "CREATED",
      "timestamp": "2025-11-29T10:35:00.000Z",
      "message": "Orden creada y pago confirmado"
    },
    {
      "status": "PREPARING",
      "timestamp": "2025-11-29T10:40:00.000Z",
      "message": "En preparación en cocina"
    },
    {
      "status": "READY",
      "timestamp": "2025-11-29T10:55:00.000Z",
      "message": "Orden lista para entrega"
    },
    {
      "status": "IN_TRANSIT",
      "timestamp": "2025-11-29T11:00:00.000Z",
      "message": "En camino a tu dirección"
    }
  ],
  "driver": {
    "driverId": "driver_001",
    "name": "Carlos Mendoza",
    "phone": "+51987654321",
    "vehicleType": "Moto",
    "vehiclePlate": "ABC-123",
    "currentLocation": {
      "lat": -12.0480,
      "lng": -77.0440,
      "updatedAt": "2025-11-29T11:05:00.000Z"
    }
  },
  "estimatedDeliveryTime": "2025-11-29T11:20:00.000Z",
  "createdAt": "2025-11-29T10:35:00.000Z",
  "updatedAt": "2025-11-29T11:05:00.000Z"
}
```

**Ejemplo TypeScript:**
```typescript
export const getOrderDetail = async (orderId: string): Promise<Order> => {
  return apiRequest<Order>({
    method: 'GET',
    url: `/orders/${orderId}`,
  });
};
```

---

### **4. Cancelar Orden**

**Endpoint:** `PUT /orders/{orderId}/cancel`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Cancela una orden (solo si está en estado CREATED o PREPARING)

**Request Body:**
```json
{
  "reason": "Cambié de opinión"
}
```

**Response Success (200):**
```json
{
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "status": "CANCELLED",
  "cancelledAt": "2025-11-29T10:40:00.000Z",
  "refundStatus": "PROCESSING",
  "message": "Orden cancelada exitosamente. El reembolso se procesará en 3-5 días hábiles."
}
```

**Response Error (400):**
```json
{
  "error": "No se puede cancelar la orden. Ya está en camino.",
  "statusCode": 400
}
```

**Ejemplo TypeScript:**
```typescript
export const cancelOrder = async (
  orderId: string,
  reason?: string
): Promise<{ orderId: string; status: string; message: string }> => {
  return apiRequest({
    method: 'PUT',
    url: `/orders/${orderId}/cancel`,
    data: { reason },
  });
};
```

---

## 💳 PAGOS

### **⚠️ NOTA IMPORTANTE SOBRE PAGOS**

El sistema actual utiliza **pagos simulados automáticamente al crear la orden**. NO es necesario llamar a endpoints de pago separados. Sin embargo, estos endpoints están disponibles para integraciones futuras.

### **1. Confirmar Pago (Opcional - Ya incluido en POST /orders)**

**Endpoint:** `POST /payments/confirm`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Procesa el pago de una orden (simulado)

**Request Body:**
```json
{
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "paymentStatus": "PAID",
  "transactionId": "TXN#ABC12345",
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "amount": 67.00,
  "currency": "PEN",
  "simulation": true,
  "notice": "✅ Pago procesado instantáneamente (simulación)"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "paymentStatus": "FAILED",
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "error": "Pago rechazado",
  "simulation": true
}
```

**Ejemplo TypeScript:**
```typescript
export const confirmPayment = async (orderId: string): Promise<{
  success: boolean;
  paymentStatus: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
}> => {
  return apiRequest({
    method: 'POST',
    url: '/payments/confirm',
    data: { orderId },
  });
};
```

---

## 📍 TRACKING

### **1. Tracking en Tiempo Real**

**Endpoint:** `GET /delivery/orders/{orderId}/tracking`
**Autenticación:** Bearer Token (Cliente)
**Descripción:** Obtiene información de tracking y ubicación del repartidor

**Response Success (200):**
```json
{
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-2025-1129-001",
  "status": "IN_TRANSIT",
  "driver": {
    "driverId": "driver_001",
    "name": "Carlos Mendoza",
    "phone": "+51987654321",
    "vehicleType": "Moto",
    "vehiclePlate": "ABC-123",
    "photo": "https://s3.amazonaws.com/fridays-drivers/carlos.jpg",
    "rating": 4.8,
    "currentLocation": {
      "lat": -12.0480,
      "lng": -77.0440,
      "updatedAt": "2025-11-29T11:05:00.000Z"
    }
  },
  "deliveryAddress": {
    "street": "Av. Siempre Viva",
    "number": "123",
    "district": "San Isidro",
    "coordinates": {
      "lat": -12.0464,
      "lng": -77.0428
    }
  },
  "estimatedDeliveryTime": "2025-11-29T11:20:00.000Z",
  "distanceToDestination": 1.2,
  "timeToDestination": 15,
  "route": [
    { "lat": -12.0480, "lng": -77.0440 },
    { "lat": -12.0470, "lng": -77.0435 },
    { "lat": -12.0464, "lng": -77.0428 }
  ]
}
```

**Ejemplo TypeScript:**
```typescript
interface TrackingInfo {
  orderId: string;
  orderNumber: string;
  status: string;
  driver: {
    driverId: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    photo: string;
    rating: number;
    currentLocation: {
      lat: number;
      lng: number;
      updatedAt: string;
    };
  };
  deliveryAddress: any;
  estimatedDeliveryTime: string;
  distanceToDestination: number;
  timeToDestination: number;
  route: Array<{ lat: number; lng: number }>;
}

export const getOrderTracking = async (orderId: string): Promise<TrackingInfo> => {
  return apiRequest<TrackingInfo>({
    method: 'GET',
    url: `/delivery/orders/${orderId}/tracking`,
  });
};
```

---

## 🔌 WEBSOCKET (Notificaciones en Tiempo Real)

### **Conexión WebSocket**

**URL:** `wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev?token=YOUR_JWT_TOKEN`

**Descripción:** Recibe notificaciones en tiempo real sobre cambios en órdenes

### **Implementación TypeScript:**

```typescript
// src/lib/websocket.ts
class OrderWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(token: string, onMessage: (data: any) => void) {
    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ WebSocket conectado');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Notificación recibida:', data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket cerrado');
      this.reconnect(token, onMessage);
    };
  }

  private reconnect(token: string, onMessage: (data: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reintentando conexión... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(token, onMessage);
      }, this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const orderWebSocket = new OrderWebSocket();
```

### **Hook de React:**

```typescript
// src/hooks/useOrderNotifications.ts
import { useEffect } from 'react';
import { orderWebSocket } from '../lib/websocket';

interface OrderNotification {
  type: 'ORDER_STATUS_UPDATE' | 'DRIVER_LOCATION_UPDATE' | 'ORDER_DELIVERED';
  orderId: string;
  status?: string;
  message: string;
  timestamp: string;
  data?: any;
}

export function useOrderNotifications(
  onNotification: (notification: OrderNotification) => void
) {
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      orderWebSocket.connect(token, (data: OrderNotification) => {
        onNotification(data);
      });
    }

    return () => {
      orderWebSocket.disconnect();
    };
  }, [onNotification]);
}
```

### **Tipos de Notificaciones:**

---

## 📊 ESTADOS DE ORDEN

### **Ciclo de Vida de una Orden**

```
PENDING_PAYMENT (no se usa - pago automático)
    ↓
CREATED (orden creada y pagada)
    ↓
PREPARING (en cocina)
    ↓
READY (lista para recoger/enviar)
    ↓
IN_TRANSIT (repartidor en camino)
    ↓
DELIVERED (entregada)

    ⤷ CANCELLED (cancelada - solo en CREATED/PREPARING)
```

### **Estados Detallados**

| Estado | Descripción | Acciones del Cliente | Color UI |
|--------|-------------|---------------------|----------|
| `CREATED` | Orden creada y pago confirmado | Ver detalle, Cancelar | 🟡 Amarillo |
| `PREPARING` | En preparación en cocina | Ver detalle, Cancelar | 🟠 Naranja |
| `READY` | Lista para entrega | Ver detalle | 🔵 Azul |
| `IN_TRANSIT` | En camino al cliente | Ver tracking, Llamar repartidor | 🟣 Morado |
| `DELIVERED` | Entregada exitosamente | Ver detalle, Calificar | 🟢 Verde |
| `CANCELLED` | Cancelada por el cliente | Ver detalle | 🔴 Rojo |

### **Tiempos Estimados**

| Fase | Tiempo Promedio |
|------|-----------------|
| `CREATED` → `PREPARING` | 2-5 minutos |
| `PREPARING` → `READY` | 10-20 minutos |
| `READY` → `IN_TRANSIT` | 5-10 minutos |
| `IN_TRANSIT` → `DELIVERED` | 15-30 minutos |
| **TOTAL** | **30-60 minutos** |

### **Ejemplo de Timeline**

```typescript
interface OrderTimeline {
  status: string;
  timestamp: string;
  message: string;
  actor?: string; // Usuario que realizó la acción
}

// Ejemplo:
const timeline: OrderTimeline[] = [
  {
    status: "CREATED",
    timestamp: "2025-11-29T10:35:00.000Z",
    message: "Orden creada y pago confirmado",
  },
  {
    status: "PREPARING",
    timestamp: "2025-11-29T10:40:00.000Z",
    message: "En preparación en cocina",
    actor: "Chef Carlos"
  },
  {
    status: "READY",
    timestamp: "2025-11-29T10:55:00.000Z",
    message: "Orden lista para entrega",
  },
  {
    status: "IN_TRANSIT",
    timestamp: "2025-11-29T11:00:00.000Z",
    message: "En camino a tu dirección",
    actor: "Repartidor Juan"
  },
  {
    status: "DELIVERED",
    timestamp: "2025-11-29T11:20:00.000Z",
    message: "¡Orden entregada! ¡Buen provecho!",
  }
];
```

---

## 👤 ROLES Y PERMISOS

### **Roles del Sistema**

| Rol | Descripción | Frontend |
|-----|-------------|----------|
| `Cliente` | Usuario final que hace pedidos | ✅ Este frontend |
| `Digitador` | Toma pedidos por teléfono | ❌ Frontend trabajadores |
| `Cheff` | Chef ejecutivo (supervisor) | ❌ Frontend trabajadores |
| `Cocinero` | Cocina los platillos | ❌ Frontend trabajadores |
| `Empacador` | Empaca las órdenes | ❌ Frontend trabajadores |
| `Repartidor` | Entrega las órdenes | ❌ Frontend trabajadores |
| `Admin` | Administrador del sistema | ❌ Frontend trabajadores |

### **Permisos del Cliente**

El rol `Cliente` tiene acceso a:

✅ **Permitido:**
- Ver menú (público)
- Registrarse
- Iniciar sesión
- Ver su perfil
- Gestionar su carrito
- Crear órdenes
- Ver sus órdenes
- Ver detalle de sus órdenes
- Cancelar sus órdenes (CREATED/PREPARING)
- Ver tracking de sus órdenes
- Recibir notificaciones de sus órdenes

❌ **NO Permitido:**
- Ver órdenes de otros clientes
- Modificar productos del menú
- Ver dashboard de cocina
- Ver dashboard de delivery
- Asignar repartidores
- Cambiar estados de orden manualmente
- Ver métricas del negocio

### **Validación de Ownership**

El backend valida automáticamente que:

```typescript
// Cliente solo puede ver SUS órdenes
if (order.userId !== tokenUserId) {
  return { statusCode: 403, error: "No autorizado" };
}
```

**No necesitas validar esto en el frontend**, el backend lo hace.

---

## 🧪 TESTING

### **Endpoints para Testing**

#### **1. Usuarios de Prueba**

Puedes crear usuarios de prueba o usar estos ejemplos:

```json
{
  "email": "test.cliente@fridays.pe",
  "password": "Test123!"
}
```

#### **2. Testing de Flujo Completo**

```typescript
// test-flow.spec.ts
describe('Flujo completo de compra', () => {
  let token: string;
  let orderId: string;

  it('1. Registrar usuario', async () => {
    const response = await register({
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User'
    });
    expect(response.token).toBeDefined();
    token = response.token;
  });

  it('2. Ver menú', async () => {
    const menu = await getMenu();
    expect(menu.products.length).toBeGreaterThan(0);
  });

  it('3. Agregar al carrito', async () => {
    const cart = await syncCart([
      { productId: 'prod_001', quantity: 2 }
    ]);
    expect(cart.cart.items.length).toBe(1);
  });

  it('4. Crear orden', async () => {
    const order = await createOrder({
      items: [{ productId: 'prod_001', quantity: 2, price: 25.50 }],
      deliveryAddress: {
        street: 'Test St',
        number: '123',
        district: 'Test',
        city: 'Lima'
      },
      paymentMethod: 'CARD'
    });
    expect(order.data.order.status).toBe('CREATED');
    orderId = order.data.order.orderId;
  });

  it('5. Ver orden', async () => {
    const order = await getOrderDetail(orderId);
    expect(order.orderId).toBe(orderId);
  });
});
```

#### **3. Testing del Pago**

```typescript
describe('Simulación de pago', () => {
  it('Debe simular pago exitoso (95%)', async () => {
    let successCount = 0;
    const attempts = 100;

    for (let i = 0; i < attempts; i++) {
      try {
        await createOrder(orderData);
        successCount++;
      } catch (error) {
        // Pago rechazado (esperado ~5%)
      }
    }

    // Aproximadamente 95% de éxito
    expect(successCount).toBeGreaterThan(90);
    expect(successCount).toBeLessThan(100);
  });
});
```

#### **4. Testing de WebSocket**

```typescript
describe('WebSocket notifications', () => {
  it('Debe recibir notificaciones', (done) => {
    const token = 'your-test-token';
    let notificationReceived = false;

    orderWebSocket.connect(token, (notification) => {
      notificationReceived = true;
      expect(notification.type).toBeDefined();
      expect(notification.orderId).toBeDefined();
      done();
    });

    // Simular cambio de estado (necesitas crear orden primero)
    setTimeout(() => {
      if (!notificationReceived) {
        done.fail('No se recibió notificación');
      }
    }, 30000);
  });
});
```

### **Postman Collection**

Importa la colección de Postman del backend:

```bash
backend/postman/Fridays-Ecommerce-Service.postman_collection.json
```

Variables necesarias:
```json
{
  "baseUrl": "https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev",
  "token": "tu-jwt-token"
}
```

---

## ⚠️ MANEJO DE ERRORES
  "type": "ORDER_STATUS_UPDATE",
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-2025-1129-001",
  "status": "PREPARING",
  "message": "Tu orden está siendo preparada en cocina",
  "timestamp": "2025-11-29T10:40:00.000Z"
}
```

#### **2. Actualización de Ubicación del Repartidor:**
```json
{
  "type": "DRIVER_LOCATION_UPDATE",
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "driverId": "driver_001",
    "location": {
      "lat": -12.0475,
      "lng": -77.0435
    },
    "distanceToDestination": 0.8,
    "timeToDestination": 10
  },
  "timestamp": "2025-11-29T11:10:00.000Z"
}
```

#### **3. Orden Entregada:**
```json
{
  "type": "ORDER_DELIVERED",
  "orderId": "ORDER#550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-2025-1129-001",
  "message": "¡Tu orden ha sido entregada! ¿Cómo fue tu experiencia?",
  "timestamp": "2025-11-29T11:20:00.000Z"
}
```

### **Uso en Componente:**

```typescript
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { toast } from 'react-hot-toast'; // o tu librería de notificaciones

function OrderTrackingPage() {
  useOrderNotifications((notification) => {
    switch (notification.type) {
      case 'ORDER_STATUS_UPDATE':
        toast.success(notification.message);
        // Actualizar UI
        break;

      case 'DRIVER_LOCATION_UPDATE':
        // Actualizar mapa
        updateMapMarker(notification.data.location);
        break;

      case 'ORDER_DELIVERED':
        toast.success(notification.message);
        // Mostrar modal de calificación
        showRatingModal();
        break;
    }
  });

  return (
    // Tu componente
  );
}
```

---

## ⚠️ MANEJO DE ERRORES

### **Códigos de Estado HTTP:**

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 402 | Payment Required | Pago rechazado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error del servidor |

### **Estructura de Errores:**

```json
{
  "error": "Mensaje de error legible",
  "statusCode": 400,
  "details": {
    "field": "email",
    "message": "Email inválido"
  }
}
```

### **Interceptor de Errores (Recomendado):**

```typescript
// src/lib/api-client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.error || error.message;

    switch (status) {
      case 401:
        // Token expirado
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        break;

      case 402:
        // Pago rechazado
        toast.error('Pago rechazado. Por favor intenta nuevamente.');
        break;

      case 400:
        // Datos inválidos
        toast.error(message);
        break;

      case 404:
        toast.error('Recurso no encontrado');
        break;

      case 500:
        toast.error('Error del servidor. Por favor intenta más tarde.');
        break;

      default:
        toast.error('Ocurrió un error inesperado');
    }

    return Promise.reject(error);
  }
);
```

---

## 📝 EJEMPLOS COMPLETOS

### **1. Flujo Completo de Compra:**

```typescript
// src/services/checkout.service.ts
import { login, getMenu, syncCart, createOrder, getOrderDetail } from './api';
import { orderWebSocket } from '../lib/websocket';

export class CheckoutService {
  // 1. Iniciar sesión
  async authenticate(email: string, password: string) {
    const response = await login({ email, password });
    // Token se guarda automáticamente en localStorage
    return response;
  }

  // 2. Cargar menú
  async loadMenu() {
    const menu = await getMenu(1, 50);
    return menu.products;
  }

  // 3. Agregar items al carrito
  async addItemsToCart(items: CartItem[]) {
    const cart = await syncCart(items);
    return cart;
  }

  // 4. Crear orden (incluye pago automático)
  async checkout(orderData: CreateOrderRequest) {
    try {
      const result = await createOrder(orderData);

      if (result.success) {
        console.log('✅ Orden creada:', result.data.order.orderNumber);
        console.log('✅ Pago confirmado:', result.data.payment.transactionId);

        // Conectar WebSocket para recibir actualizaciones
        const token = localStorage.getItem('token')!;
        orderWebSocket.connect(token, (notification) => {
          console.log('📨 Notificación:', notification);
        });

        return result.data.order;
      }
    } catch (error: any) {
      if (error.status === 402) {
        throw new Error('Pago rechazado. Por favor intenta nuevamente.');
---

## ❓ PREGUNTAS FRECUENTES

### **1. ¿Necesito configurar AWS credentials?**
**NO**. El frontend solo consume las APIs HTTP públicas. No necesitas:
- AWS Access Keys
- AWS Secret Keys
- AWS SDK configurado

Solo necesitas las URLs de los endpoints.

### **2. ¿Cómo manejo el refresh del token?**
```typescript
// Interceptor automático
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar renovar
      try {
        const { token } = await refreshToken();
        // Reintentar petición original
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(error.config);
      } catch {
        // Redirect a login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### **3. ¿Cómo sé si el pago fue exitoso?**
El endpoint `POST /orders` retorna:
- **Success (201)**: `{ success: true, data: { order, payment } }`
- **Payment Failed (402)**: `{ success: false, error: "Pago rechazado" }`

Si la petición retorna 201, el pago fue exitoso.

### **4. ¿Puedo usar el carrito sin autenticación?**
**NO**. Todos los endpoints de carrito requieren token JWT.

Opción: Mantener carrito en `localStorage` localmente y sincronizar al hacer login:
```typescript
// Antes del login
const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

// Después del login
await syncCart(localCart);
localStorage.removeItem('cart');
```

### **5. ¿Cómo actualizo la ubicación del repartidor en tiempo real?**
Hay 2 opciones:

**Opción A: WebSocket (Recomendado)**
```typescript
useOrderNotifications((notification) => {
  if (notification.type === 'DRIVER_LOCATION_UPDATE') {
    updateMapMarker(notification.data.location);
  }
});
```

**Opción B: Polling**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const tracking = await getOrderTracking(orderId);
    updateMapMarker(tracking.driver.currentLocation);
  }, 10000); // cada 10 segundos

  return () => clearInterval(interval);
}, [orderId]);
```

### **6. ¿Qué pasa si el WebSocket se desconecta?**
La implementación incluye reconexión automática:
```typescript
// Hasta 5 intentos con 3 segundos de espera
private maxReconnectAttempts = 5;
private reconnectDelay = 3000;
```

### **7. ¿Puedo cambiar el estado de una orden?**
**NO**. Los clientes no pueden cambiar estados manualmente. Los estados cambian automáticamente cuando:
- Cocina marca como preparado
- Repartidor confirma entrega
- Sistema detecta eventos

### **8. ¿Cómo manejo imágenes de productos?**
Las URLs vienen en el response:
```json
{
  "imageUrl": "https://s3.amazonaws.com/fridays-images/producto.jpg"
}
```

Para placeholder cuando no hay imagen:
```typescript
const imageSrc = product.imageUrl || '/placeholder-food.jpg';
```

### **9. ¿Necesito implementar paginación?**
**Recomendado** para el menú. El endpoint acepta:
```typescript
GET /menu?page=1&limit=20
```

Ejemplo con scroll infinito:
```typescript
const loadMore = async () => {
  const nextPage = currentPage + 1;
  const newProducts = await getMenu(nextPage, 20);
  setProducts([...products, ...newProducts.products]);
  setCurrentPage(nextPage);
};
```

### **10. ¿Cómo implemento búsqueda con debounce?**
```typescript
import { useDebounce } from './hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchProducts(debouncedSearch);
  }
}, [debouncedSearch]);
```

### **11. ¿Puedo probar sin backend desplegado?**
**Sí**, con Mock Service Worker (MSW):
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-token',
        userId: 'mock-user-id'
      })
    );
  }),
  // más handlers...
];
```

### **12. ¿Qué librerías de mapas recomiendas?**
- **Leaflet + React Leaflet**: Ligero, open source
- **Google Maps**: Requiere API key
- **Mapbox**: Mejor performance, requiere token

Ejemplo con Leaflet:
```bash
npm install leaflet react-leaflet
```

### **13. ¿Cómo optimizo las peticiones?**
Usa React Query / TanStack Query:
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['menu'],
  queryFn: () => getMenu(),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
});
```

### **14. ¿El backend guarda el carrito entre sesiones?**
**SÍ**. Cuando sincronizas con `POST /cart/sync`, el backend lo guarda en DynamoDB. Al volver a iniciar sesión, puedes obtener el carrito.

### **15. ¿Cómo manejo múltiples órdenes activas?**
Un cliente puede tener múltiples órdenes. Filtra por estado:
```typescript
const activeOrders = orders.filter(o =>
  ['CREATED', 'PREPARING', 'READY', 'IN_TRANSIT'].includes(o.status)
);

const completedOrders = orders.filter(o =>
  o.status === 'DELIVERED'
);
```

---

## 📚 RECURSOS ADICIONALES

### **Documentación del Backend**
- `backend/README.md` - Visión general
- `backend/ENDPOINT-FLOW-GUIDE.md` - Flujo completo con ejemplos curl
- `backend/DEPLOYMENT-GUIDE.md` - Deployment y testing
- `backend/ARCHITECTURE-AUDIT.md` - Arquitectura técnica

### **Colecciones Postman**
- `backend/postman/Fridays-Ecommerce-Service.postman_collection.json`
- `backend/postman/Fridays-WebSocket-Service.postman_collection.json`

### **Variables de Entorno de Ejemplo**
```bash
# .env.example
VITE_API_BASE_URL=https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev
VITE_DELIVERY_FEE=5.00
VITE_GOOGLE_MAPS_API_KEY=your-key-here
VITE_ENV=development
```

### **Stack Tecnológico Recomendado**

**Core:**
- React 18+
- TypeScript 5+
- Vite 5+

**Routing:**
- React Router DOM 6+

**State Management:**
- React Query / TanStack Query (server state)
- Zustand / Context API (client state)

**HTTP Client:**
- Axios (recomendado para interceptores)

**UI/Styling:**
- Tailwind CSS
- Shadcn/ui o Material-UI

**Maps:**
- React Leaflet + Leaflet

**Notifications:**
- React Hot Toast o Sonner

**Forms:**
- React Hook Form + Zod

**Testing:**
- Vitest
- React Testing Library
- MSW (Mock Service Worker)

---

## ✅ CHECKLIST FINAL DE IMPLEMENTACIÓN

### **Fase 1: Setup Básico**
- [ ] Crear proyecto con Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Instalar dependencias (axios, react-router-dom, etc.)
- [ ] Crear archivo .env con URLs del backend
- [ ] Configurar cliente API con interceptores
- [ ] Configurar React Router

### **Fase 2: Autenticación**
- [ ] Crear página de login
- [ ] Crear página de registro
- [ ] Implementar servicio de autenticación
- [ ] Guardar token en localStorage
- [ ] Crear ProtectedRoute component
- [ ] Implementar refresh token automático
- [ ] Crear hook useAuth

### **Fase 3: Menú y Catálogo**
- [ ] Crear página de menú
- [ ] Implementar listado de productos con paginación
- [ ] Implementar filtros por categoría
- [ ] Implementar búsqueda de productos
- [ ] Crear página de detalle de producto
- [ ] Agregar imágenes y placeholders

### **Fase 4: Carrito de Compras**
- [ ] Crear contexto/store del carrito
- [ ] Implementar agregar al carrito
- [ ] Crear página del carrito
- [ ] Implementar actualizar cantidad
- [ ] Implementar eliminar item
- [ ] Mostrar contador en navbar
- [ ] Sincronizar con backend

### **Fase 5: Checkout y Órdenes**
- [ ] Crear página de checkout
- [ ] Formulario de dirección de entrega
- [ ] Implementar crear orden (incluye pago)
- [ ] Manejar pago exitoso
- [ ] Manejar pago rechazado
- [ ] Vaciar carrito después de orden exitosa
- [ ] Redirigir a tracking

### **Fase 6: Tracking de Órdenes**
- [ ] Crear página de mis órdenes
- [ ] Crear página de tracking individual
- [ ] Integrar mapa (Leaflet)
- [ ] Mostrar ubicación del repartidor
- [ ] Mostrar ruta al destino
- [ ] Mostrar timeline de estados
- [ ] Implementar botón llamar repartidor

### **Fase 7: WebSocket y Notificaciones**
- [ ] Implementar cliente WebSocket
- [ ] Crear hook useOrderNotifications
- [ ] Conectar WebSocket al iniciar sesión
- [ ] Manejar notificaciones de cambio de estado
- [ ] Manejar notificaciones de ubicación
- [ ] Mostrar toast notifications
- [ ] Actualizar UI en tiempo real

### **Fase 8: UX y Mejoras**
- [ ] Implementar loading states
- [ ] Implementar error boundaries
- [ ] Agregar animaciones y transiciones
- [ ] Optimizar imágenes (lazy loading)
- [ ] Implementar skeleton loaders
- [ ] Agregar feedback visual
- [ ] Implementar modo offline básico

### **Fase 9: Testing**
- [ ] Unit tests para servicios API
- [ ] Tests de componentes con RTL
- [ ] Tests de integración
- [ ] Tests E2E con Playwright/Cypress
- [ ] Testing con MSW para mocks

### **Fase 10: Deployment**
- [ ] Configurar build de producción
- [ ] Optimizar bundle size
- [ ] Configurar variables de entorno por ambiente
- [ ] Deploy a Vercel/Netlify/AWS Amplify
- [ ] Configurar dominio
- [ ] SSL/HTTPS
- [ ] Monitoreo de errores (Sentry)

---

**¡Listo para construir tu frontend! 🎉**

**¿Tienes dudas?** Revisa la documentación del backend en `backend/` o las colecciones de Postman para más ejemplos.
  }

  // 5. Seguir orden
  async trackOrder(orderId: string) {
    const order = await getOrderDetail(orderId);
    return order;
  }
}
```

### **2. Componente de Checkout:**

```typescript
// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutService } from '../services/checkout.service';

export function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const checkoutService = new CheckoutService();

  const handleCheckout = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Preparar datos de la orden
      const orderData: CreateOrderRequest = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
          notes: item.notes,
        })),
        deliveryAddress: {
          street: formData.street,
          number: formData.number,
          district: formData.district,
          city: 'Lima',
          reference: formData.reference,
        },
        paymentMethod: 'CARD',
        notes: formData.orderNotes,
      };

      // Crear orden (incluye pago automático)
      const order = await checkoutService.checkout(orderData);

      // Mostrar éxito
      toast.success(`¡Orden confirmada! Número: ${order.orderNumber}`);

      // Redirigir a tracking
      navigate(`/orders/${order.orderId}/tracking`);

    } catch (err: any) {
      setError(err.message || 'Error al procesar la orden');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      {/* Tu formulario */}
      <button
        onClick={() => handleCheckout(formData)}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Confirmar Pedido'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
```

### **3. Componente de Tracking:**

```typescript
// src/pages/OrderTrackingPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail, getOrderTracking } from '../services/api';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { MapContainer, Marker, Polyline } from 'react-leaflet';

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);

  // Cargar orden inicial
  useEffect(() => {
    loadOrder();
    loadTracking();
  }, [orderId]);

  const loadOrder = async () => {
    const data = await getOrderDetail(orderId!);
    setOrder(data);
  };

  const loadTracking = async () => {
    if (order?.status === 'IN_TRANSIT' || order?.status === 'READY') {
      const data = await getOrderTracking(orderId!);
      setTracking(data);
    }
  };

  // Escuchar notificaciones en tiempo real
  useOrderNotifications((notification) => {
    if (notification.orderId === orderId) {
      // Actualizar estado de orden
      if (notification.type === 'ORDER_STATUS_UPDATE') {
        setOrder(prev => prev ? { ...prev, status: notification.status! } : null);
      }

      // Actualizar ubicación del repartidor
      if (notification.type === 'DRIVER_LOCATION_UPDATE') {
        setTracking(prev => prev ? {
          ...prev,
          driver: {
            ...prev.driver,
            currentLocation: notification.data.location,
          }
        } : null);
      }
    }
  });

  // Actualizar tracking cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (order?.status === 'IN_TRANSIT') {
        loadTracking();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [order?.status]);

  return (
    <div className="tracking-page">
      <div className="order-status">
        <h2>Orden {order?.orderNumber}</h2>
        <StatusBadge status={order?.status} />
      </div>

      {tracking && (
        <div className="map-container">
          <MapContainer
            center={[tracking.driver.currentLocation.lat, tracking.driver.currentLocation.lng]}
            zoom={15}
          >
            {/* Marcador del repartidor */}
            <Marker position={[
              tracking.driver.currentLocation.lat,
              tracking.driver.currentLocation.lng
            ]} />

            {/* Marcador de destino */}
            <Marker position={[
              tracking.deliveryAddress.coordinates.lat,
              tracking.deliveryAddress.coordinates.lng
            ]} />

            {/* Ruta */}
            <Polyline positions={tracking.route} />
          </MapContainer>

          <div className="driver-info">
            <img src={tracking.driver.photo} alt={tracking.driver.name} />
            <div>
              <h3>{tracking.driver.name}</h3>
              <p>{tracking.driver.vehicleType} - {tracking.driver.vehiclePlate}</p>
              <p>⭐ {tracking.driver.rating}</p>
            </div>
            <a href={`tel:${tracking.driver.phone}`}>
              Llamar
            </a>
          </div>

          <div className="eta">
            <p>Llegará en {tracking.timeToDestination} minutos</p>
            <p>{tracking.distanceToDestination.toFixed(1)} km de distancia</p>
          </div>
        </div>
      )}

      <div className="order-timeline">
        {order?.timeline.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timestamp">
              {new Date(item.timestamp).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="status">{item.status}</div>
            <div className="message">{item.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 QUICK START

### **1. Instalar dependencias:**
```bash
npm install axios react-router-dom react-hot-toast leaflet react-leaflet
```

### **2. Crear archivo .env:**
```bash
VITE_API_BASE_URL=https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev
VITE_WS_URL=wss://9bymcj94u7.execute-api.us-east-1.amazonaws.com/dev
```

### **3. Copiar cliente API:**
Copiar el código de `api-client.ts` de la sección [Configuración Inicial](#configuración-inicial)

### **4. Crear servicio API:**
```typescript
// src/services/api.ts
export * from './auth.service';
export * from './menu.service';
export * from './cart.service';
export * from './order.service';
```

### **5. Implementar autenticación:**
Ver ejemplo completo en [Autenticación](#autenticación)

---

## 📞 SOPORTE

**Postman Collection:** Ver `backend/postman/Fridays-Ecommerce-Service.postman_collection.json`
**Documentación Backend:** Ver `backend/ENDPOINT-FLOW-GUIDE.md`
**Guía de Deployment:** Ver `backend/DEPLOYMENT-GUIDE.md`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Configurar variables de entorno
- [ ] Implementar cliente API con axios
- [ ] Crear servicios de autenticación
- [ ] Implementar catálogo de menú
- [ ] Crear gestión de carrito
- [ ] Implementar proceso de checkout
- [ ] Integrar WebSocket para notificaciones
- [ ] Crear página de tracking con mapa
- [ ] Implementar manejo de errores
- [ ] Agregar loading states
- [ ] Testing end-to-end

---

**¡Listo para construir tu frontend! 🎉**
