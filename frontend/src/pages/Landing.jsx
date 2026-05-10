import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-300/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-2xl">♻️</span>
              </div>
              <span className="text-2xl font-bold text-gradient">EcoCollect</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="glass-button">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/50 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Serving 50+ cities worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Waste Collection<br />
              <span className="text-gradient">Made Simple</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Schedule pickups, track your recycling, and contribute to a cleaner planet. 
              EcoCollect makes waste management effortless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="glass-button text-lg px-8 py-4">
                Start Recycling Today
              </Link>
              <Link to="/login" className="glass-button-secondary text-lg px-8 py-4">
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to start recycling</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '📱',
              title: 'Schedule Pickup',
              description: 'Book a pickup in seconds. Select your waste type, choose a convenient time, and we\'ll handle the rest.'
            },
            {
              icon: '🚚',
              title: 'We Collect',
              description: 'Our professional drivers arrive at your location. Track their arrival in real-time.'
            },
            {
              icon: '🌍',
              title: 'We Recycle',
              description: 'Your waste is properly sorted and sent to recycling facilities. You help the planet!'
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Categories */}
      <div className="bg-white/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">We Accept</h2>
            <p className="text-xl text-gray-600">Various types of waste for recycling</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: '♻️', name: 'Plastic', color: 'from-blue-400 to-blue-600' },
              { icon: '🔩', name: 'Metal', color: 'from-gray-400 to-gray-600' },
              { icon: '📱', name: 'E-Waste', color: 'from-purple-400 to-purple-600' },
              { icon: '📰', name: 'Paper', color: 'from-amber-400 to-amber-600' },
              { icon: '🌱', name: 'Organic', color: 'from-green-400 to-green-600' }
            ].map((category, idx) => (
              <div key={idx} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-3`}>
                  {category.icon}
                </div>
                <p className="font-medium text-gray-800">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50K+', label: 'Happy Users' },
              { value: '100K+', label: 'Pickups Completed' },
              { value: '500+', label: 'Tons Recycled' },
              { value: '50+', label: 'Cities Served' }
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl md:text-5xl font-bold text-gradient mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl mb-8 text-primary-100">Join thousands of users recycling smarter</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors">
              Create Free Account
            </Link>
            <Link to="/login" className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-xl">♻️</span>
              </div>
              <span className="text-xl font-bold">EcoCollect</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Services</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-gray-400">© 2024 EcoCollect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing