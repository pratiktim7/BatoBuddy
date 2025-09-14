# 🚌 BatoBuddy - Smart Transit Navigation for Kathmandu

<div align="center">

![BatoBuddy Logo](https://img.shields.io/badge/BatoBuddy-Smart%20Transit-blue?style=for-the-badge&logo=map&logoColor=white)

**A Google Maps-style transit navigation app for Kathmandu Valley's public transportation system**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

[🚀 Live Demo](#) | [📖 Documentation](#features) | [🐛 Report Bug](https://github.com/pratiktim7/BatoBuddy/issues) | [✨ Request Feature](https://github.com/pratiktim7/BatoBuddy/issues)

</div>

---

## 🌟 About BatoBuddy

BatoBuddy is a modern, Google Maps-inspired transit navigation application specifically designed for Kathmandu Valley's public transportation network. Built with React and TypeScript, it provides real-time route planning, live bus tracking, and comprehensive landmark information to make public transit navigation effortless.

### 🎯 Why BatoBuddy?

- **Local Focus**: Specifically designed for Kathmandu Valley's unique transit system
- **Google Maps UX**: Familiar interface with floating panels and smooth animations
- **Real Data**: Uses authentic Kathmandu route and stop data
- **Student-Friendly**: Built-in student discount calculator
- **Landmark Integration**: Discover restaurants, temples, parks, and more along your route

---

## ✨ Features

### 🗺️ **Smart Route Planning**
- **Intelligent Search**: Auto-complete location search with fuzzy matching
- **Multi-Route Options**: Compare different route possibilities
- **Real-Time Updates**: Dynamic map updates as you type
- **Transfer Optimization**: Find the best connections between buses

### 🎨 **Google Maps-Style Interface**
- **Full-Screen Maps**: Immersive mapping experience
- **Floating Panels**: Clean, modern UI with smooth animations
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark/Light Theme**: Adaptive theming for any time of day

### 🚌 **Live Transit Information**
- **Real-Time Bus Tracking**: See live bus positions and arrival times
- **Route Visualization**: Clear route paths with stop markers
- **Schedule Information**: Access to bus timings and frequency
- **Service Updates**: Get notified about route changes

### 📍 **Landmark Discovery**
- **Category Filters**: Restaurants 🍽️, Temples 🏛️, Parks 🌳, Hospitals 🏥, Schools 🎓, Shopping 🛍️
- **Interactive Markers**: Click to see detailed information
- **Quick Toggle**: Show/hide landmark categories instantly
- **Local POIs**: Authentic Kathmandu landmarks and attractions

### 💰 **Student Discounts**
- **Discount Calculator**: Automatic 45% student fare calculation
- **ID Verification**: Student ID management system
- **Real-Time Pricing**: See both regular and discounted fares

### ⚡ **Performance & UX**
- **Fast Loading**: Optimized with Vite for instant startup
- **Smooth Animations**: Tailwind CSS animations throughout
- **Offline Ready**: Core functionality works without internet
- **Progressive Enhancement**: Graceful degradation for all devices

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratiktim7/BatoBuddy.git
   cd BatoBuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory.

---

## 🛠️ Tech Stack

### Frontend
- **⚛️ React 18.2.0** - Modern React with hooks and concurrent features
- **📘 TypeScript 5.0.2** - Type-safe development
- **⚡ Vite 4.4.5** - Lightning-fast build tool
- **🎨 Tailwind CSS 3.3.3** - Utility-first CSS framework

### Mapping & Visualization
- **🗺️ Leaflet 1.9.4** - Interactive maps
- **🗺️ React Leaflet 4.2.1** - React integration for Leaflet
- **🛣️ Leaflet Routing Machine** - Route calculation and visualization

### Icons & UI
- **🎭 Lucide React** - Beautiful, customizable icons
- **✨ Custom Animations** - Tailwind CSS animations and transitions

### Development Tools
- **🔧 ESLint** - Code linting and formatting
- **🎯 TypeScript ESLint** - TypeScript-specific linting rules
- **📦 PostCSS** - CSS processing with Autoprefixer

---

## 📱 Screens & Features

### 🏠 **Home Screen**
- Floating search panel with auto-complete
- Live location status indicators
- Quick access to route planning
- Landmark category toggles

### 🛣️ **Route Results**
- Multiple route options with comparison
- Detailed step-by-step directions
- Fare information with student discounts
- Transfer points and walking distances

### 🗺️ **Map View**
- Full-screen route visualization
- Interactive bus stop markers
- Real-time bus positions
- Landmark overlays

### 🚌 **Live Buses**
- Real-time bus tracking
- Route-specific bus information
- Arrival predictions
- Service alerts

### ⚙️ **Settings**
- Theme toggle (Dark/Light)
- Student ID management
- Discount preferences
- App preferences

---

## 🌏 Kathmandu Valley Coverage

BatoBuddy covers the entire Kathmandu Valley transit network including:

- **🏛️ Kathmandu** - Durbar Square, Thamel, New Road
- **🏯 Bhaktapur** - Ancient city routes and connections
- **🌄 Lalitpur** - Patan and surrounding areas
- **📚 University Areas** - Tribhuvan University, Kathmandu University
- **🏥 Medical Districts** - Major hospitals and clinics
- **🛍️ Shopping Areas** - Malls, markets, and commercial zones

### Major Landmarks Included
- **Religious Sites**: Swayambhunath, Boudhanath, Pashupatinath
- **Cultural Heritage**: Durbar Squares, Museums, Art Galleries
- **Educational**: Universities, Colleges, Schools
- **Healthcare**: Hospitals, Clinics, Medical Centers
- **Recreation**: Parks, Gardens, Sports Facilities
- **Commercial**: Shopping Centers, Markets, Business Districts

---

## 🤝 Contributing

We welcome contributions to make BatoBuddy even better! Here's how you can help:

### 🐛 **Bug Reports**
1. Check existing issues first
2. Use the bug report template
3. Include screenshots and steps to reproduce

### ✨ **Feature Requests**
1. Check if the feature already exists
2. Explain the use case clearly
3. Consider the impact on existing users

### 💻 **Code Contributions**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### 📝 **Development Guidelines**
- Follow TypeScript best practices
- Use semantic commit messages
- Add JSDoc comments for functions
- Test on multiple screen sizes
- Ensure accessibility compliance

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenStreetMap** - Base map data and tiles
- **Kathmandu Transit Data** - Route and stop information
- **Leaflet Community** - Excellent mapping library
- **React Team** - Amazing frontend framework
- **Tailwind CSS** - Beautiful utility-first CSS

---

## 📞 Support & Contact

- **🐛 Issues**: [GitHub Issues](https://github.com/pratiktim7/BatoBuddy/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/pratiktim7/BatoBuddy/discussions)
- **📧 Email**: [your.email@example.com](mailto:your.email@example.com)
- **🐦 Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🗺️ Roadmap

### 🎯 **Short Term (Next Release)**
- [ ] Offline mode for route data
- [ ] Push notifications for bus arrivals
- [ ] More landmark categories
- [ ] Route sharing functionality

### 🚀 **Medium Term**
- [ ] Real-time bus crowding information
- [ ] Multi-language support (Nepali, English)
- [ ] Voice navigation
- [ ] Accessibility improvements

### 🌟 **Long Term**
- [ ] Integration with other Nepal cities
- [ ] Ride-sharing integration
- [ ] Tourist-specific features
- [ ] API for third-party developers

---

<div align="center">

**Built with ❤️ for Kathmandu Valley**

*Making public transit accessible, one route at a time.*

[![GitHub stars](https://img.shields.io/github/stars/pratiktim7/BatoBuddy?style=social)](https://github.com/pratiktim7/BatoBuddy/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pratiktim7/BatoBuddy?style=social)](https://github.com/pratiktim7/BatoBuddy/network/members)

</div>