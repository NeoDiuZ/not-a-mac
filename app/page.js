"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShoppingBag, Sparkles, Recycle, Bot, Lock, Music, Heart, Globe, Zap, Star, Award, ArrowDown, Plus, X } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 bg-white z-0 overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'radial-gradient(black 1px, transparent 0)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Minimal gradients */}
      <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[50%] rounded-full bg-black/[0.02] blur-[80px]"></div>
      <div className="absolute top-[60%] -right-[5%] w-[50%] h-[60%] rounded-full bg-black/[0.02] blur-[100px]"></div>
    </div>
  );
};

const LandingPage = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeFeature, setActiveFeature] = useState(null);
  const heroRef = useRef(null);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const futureDate = new Date('2025-05-01').getTime();
      const now = new Date().getTime();
      const distance = futureDate - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const scrollToNextSection = () => {
    if (heroRef.current) {
      const nextSection = heroRef.current.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Feature details
  const featureDetails = {
    'eco-friendly': {
      title: 'Eco-Friendly',
      icon: <Recycle className="w-6 h-6" />,
      description: 'Crafted from ethically self-sourced recycled materials',
      extendedDescription: 'Our manufacturing process uses 100% recycled materials, reducing waste and environmental impact. Each Not-A-Mac diverts approximately 250g of plastic from landfills, contributing to a cleaner planet.',
    },
    'smart-control': {
      title: 'Smart Control',
      icon: <Bot className="w-6 h-6" />,
      description: 'Seamless interaction with your music ecosystem',
      extendedDescription: 'Advanced sensors and controls allow for intuitive gesture-based interaction. Control your music with simple movements - wave to skip tracks, tap to pause, and more.',
    },
    'unique-identity': {
      title: 'Unique Identity',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Each piece individually numbered with its own personality',
      extendedDescription: 'No two Not-A-Mac devices are exactly alike. Each unit is individually numbered and has subtle variations in its finish, making your device truly one-of-a-kind.',
    },
    'music-display': {
      title: 'Music Display',
      icon: <Music className="w-6 h-6" />,
      description: 'Elegant visualization of your current playlist',
      extendedDescription: 'The minimalist display shows currently playing tracks, album art, and playback controls in a visually stunning interface that complements any space.',
    },
    'zero-footprint': {
      title: 'Zero Footprint',
      icon: <Globe className="w-6 h-6" />,
      description: 'Sustainable manufacturing with no environmental impact',
      extendedDescription: 'Our carbon-neutral production facilities run on 100% renewable energy. We offset all shipping emissions and use biodegradable packaging materials.',
    },
    'limited-edition': {
      title: 'Limited Edition',
      icon: <Award className="w-6 h-6" />,
      description: 'Exclusive collector\'s item for design enthusiasts',
      extendedDescription: 'With only 500 units produced in our first collection, Not-A-Mac is a true collector\'s item. Each device comes with a certificate of authenticity and unique serial number.',
    }
  };

  return (
    <div className="min-h-screen font-light antialiased text-black">
      <AnimatedBackground />

      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 py-4 bg-white/70 backdrop-blur-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-sm font-medium">Not-A-Mac</div>
          <div className="flex space-x-6">
            <a href="#features" className="text-sm text-black/60 hover:text-black transition-colors">Features</a>
            <a href="#product" className="text-sm text-black/60 hover:text-black transition-colors">Product</a>
            <a href="#manifesto" className="text-sm text-black/60 hover:text-black transition-colors">Manifesto</a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-2 mb-6">
              <p className="uppercase tracking-widest text-xs font-medium">Drop #39</p>
              <h1 className="text-7xl md:text-9xl font-bold tracking-tight">
                Not-A-Mac
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-black/70 max-w-lg mx-auto mb-12 font-light">
              A minimalist desk accessory that elegantly displays and controls your music
            </p>
            
            {/* Countdown */}
            <div className="inline-flex space-x-6 mb-16">
              <CountdownItem value={timeLeft.days} label="Days" />
              <CountdownSeparator />
              <CountdownItem value={timeLeft.hours} label="Hours" />
              <CountdownSeparator />
              <CountdownItem value={timeLeft.minutes} label="Mins" />
              <CountdownSeparator />
              <CountdownItem value={timeLeft.seconds} label="Secs" />
            </div>
            
            <div>
              <a href="https://spotify-player-esp32.onrender.com/form" 
                className="inline-block px-8 py-3 border border-black transition-all duration-300 
                          hover:bg-black hover:text-white">
                Setup Your Device
              </a>
            </div>
          </div>
          
          <button 
            onClick={scrollToNextSection}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-black/50 hover:text-black
                     transition-all duration-300 animation-pulse"
          >
            <ArrowDown className="w-8 h-8" />
          </button>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-24 px-4 bg-black text-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="uppercase tracking-widest text-xs font-medium text-white/70 mb-2">Features</p>
              <h2 className="text-3xl md:text-4xl font-light">Thoughtfully Designed</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
              {Object.keys(featureDetails).map((key) => (
                <div key={key}>
                  <FeatureItem 
                    id={key}
                    icon={featureDetails[key].icon}
                    title={featureDetails[key].title}
                    description={featureDetails[key].description}
                    onClick={() => setActiveFeature(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feature Modal */}
          {activeFeature && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white text-black max-w-xl w-full p-8 relative">
                <button 
                  onClick={() => setActiveFeature(null)} 
                  className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="mb-6 flex items-center">
                  <div className="p-2 border border-black/20 rounded-full mr-4">
                    {featureDetails[activeFeature].icon}
                  </div>
                  <h3 className="text-2xl font-medium">{featureDetails[activeFeature].title}</h3>
                </div>
                <p className="mb-4 text-black/70">{featureDetails[activeFeature].description}</p>
                <p className="text-black/80 leading-relaxed">{featureDetails[activeFeature].extendedDescription}</p>
              </div>
            </div>
          )}
        </section>

        {/* Product Preview */}
        <section id="product" className="relative py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="uppercase tracking-widest text-xs font-medium text-black/70 mb-2">Coming Soon</p>
                <h2 className="text-3xl md:text-5xl font-light mb-8">Redefining desktop aesthetics</h2>
                <p className="text-black/70 text-lg mb-10 leading-relaxed">
                  A fusion of cutting-edge eco-tech and minimalist design, Not-A-Mac elevates your space while providing 
                  seamless music control. Limited edition, thoughtfully crafted.
                </p>
                <div className="space-y-6">
                  <StatItem label="Production" value="100% Eco-Friendly" />
                  <StatItem label="Uniqueness" value="1/1 Numbered Edition" />
                  <StatItem label="Availability" value="February 2025" />
                </div>
              </div>
              <div className="aspect-square bg-black/5 rounded-md flex items-center justify-center">
                <Lock className="w-20 h-20 text-black/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section id="manifesto" className="relative py-24 px-4 bg-black text-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-light leading-relaxed">
              &ldquo;Be what you could be.&rdquo;
            </p>
            <p className="mt-8 text-sm text-white/60 uppercase tracking-widest">
              Not-A-Mac Manifesto
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer" className="relative py-12 px-4 border-t border-black/10 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div>
                <p className="text-sm font-medium mb-3">Not-A-Mac</p>
                <p className="text-sm text-black/60">
                  An aesthetic desk accessory for music lovers and design enthusiasts.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Links</p>
                <div className="space-y-2">
                  <p><a href="#" className="text-sm text-black/60 hover:text-black">Setup Device</a></p>
                  <p><a href="#" className="text-sm text-black/60 hover:text-black">Support</a></p>
                  <p><a href="#" className="text-sm text-black/60 hover:text-black">Privacy Policy</a></p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Connect</p>
                <p className="text-sm text-black/60">
                  For inquiries, please email us at hello@notamac.com
                </p>
              </div>
            </div>
            <div className="pt-10 border-t border-black/10 text-center">
              <p className="text-xs text-black/50">© 2025 Not-A-Mac. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const CountdownItem = ({ value, label }) => (
  <div className="text-center">
    <p className="text-4xl font-light tabular-nums">{value.toString().padStart(2, '0')}</p>
    <p className="text-xs uppercase tracking-widest mt-1 text-black/60">{label}</p>
  </div>
);

const CountdownSeparator = () => (
  <div className="text-4xl font-light text-black/30 flex items-center">:</div>
);

const FeatureItem = ({ id, icon, title, description, onClick }) => (
  <div 
    className="flex flex-col items-start group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="mb-4 p-2 border border-white/20 rounded-full group-hover:border-white group-hover:bg-white/10 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2 flex items-center">
      {title}
      <Plus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </h3>
    <p className="text-white/70 font-light leading-relaxed">{description}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <p className="text-sm text-black/60">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default LandingPage;