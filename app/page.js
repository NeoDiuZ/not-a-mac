"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShoppingBag, Sparkles, Recycle, Bot, Lock, Music, Heart, Globe, Zap, Star, Award, ArrowDown, Plus, X } from 'lucide-react';
import Image from 'next/image';

// Parallax and animation components
const ParallaxSection = ({ children, speed = 0.1, className = '' }) => {
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const scrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const relativeScroll = scrollY - sectionTop;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div style={{ transform: `translateY(${offset}px)` }}>
        {children}
      </div>
    </div>
  );
};

const FadeIn = ({ children, className = '', delay = 0, applyClass = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible 
          ? (applyClass ? 'fade-in-visible ' : 'opacity-100 translate-y-0 filter-none')
          : (applyClass ? '' : 'opacity-0 translate-y-4 blur-[2px]')
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FlickerIn = ({ children, className = '', delay = 0, intensity = 'normal', duration = 'default' }) => {
  const [visible, setVisible] = useState(false);
  const [flickerState, setFlickerState] = useState(0); // 0 = off, 1-5 = different flicker states
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setTimeout(() => {
            // Start the flickering sequence
            setFlickerState(1);
            
            // Define the flicker sequence based on intensity and duration
            let sequence = [];
            
            if (intensity === 'title') {
              // Title-specific flickering: fewer flickers, no distortion
              sequence = [
                { state: 0, delay: 150 },  // off
                { state: 1, delay: 70 },   // dim
                { state: 0, delay: 200 },  // off (longer darkness)
                { state: 2, delay: 100 },  // brighter
                { state: 1, delay: 50 },   // dim again
                { state: 3, delay: 120 },  // even brighter
                { state: 5, delay: 0 },    // full on
              ];
            } else if (intensity === 'strong') {
              if (duration === 'long') {
                // Extended LED-like flickering with longer duration
                sequence = [
                  { state: 0, delay: 100 },  // off
                  { state: 1, delay: 80 },   // dim
                  { state: 0, delay: 150 },  // off
                  { state: 2, delay: 70 },   // brighter
                  { state: 0, delay: 200 },  // off (longer darkness)
                  { state: 1, delay: 50 },   // dim
                  { state: 0, delay: 80 },   // off
                  { state: 2, delay: 120 },  // brighter
                  { state: 1, delay: 60 },   // dim
                  { state: 3, delay: 100 },  // even brighter
                  { state: 1, delay: 80 },   // dim again
                  { state: 0, delay: 120 },  // off (another darkness)
                  { state: 2, delay: 60 },   // brighter
                  { state: 3, delay: 150 },  // even brighter
                  { state: 2, delay: 40 },   // flicker down
                  { state: 4, delay: 120 },  // almost full
                  { state: 2, delay: 50 },   // flicker down again
                  { state: 4, delay: 80 },   // almost full
                  { state: 5, delay: 0 },    // full on
                ];
              } else {
                // Regular LED-like flickering with pronounced on/off cycles
                sequence = [
                  { state: 0, delay: 50 },  // off
                  { state: 1, delay: 30 },  // dim
                  { state: 0, delay: 70 },  // off
                  { state: 2, delay: 40 },  // brighter
                  { state: 1, delay: 30 },  // dim
                  { state: 3, delay: 60 },  // even brighter
                  { state: 0, delay: 20 },  // off
                  { state: 2, delay: 30 },  // brighter
                  { state: 4, delay: 40 },  // almost full
                  { state: 2, delay: 20 },  // brighter
                  { state: 5, delay: 0 },   // full on
                ];
              }
            } else {
              // Regular, more subtle flickering
              sequence = [
                { state: 0, delay: 100 }, // off
                { state: 2, delay: 100 }, // dim
                { state: 0, delay: 100 }, // off
                { state: 3, delay: 50 },  // brighter
                { state: 2, delay: 100 }, // dim
                { state: 5, delay: 0 },   // full on
              ];
            }
            
            // Execute the sequence
            let cumulativeDelay = 0;
            sequence.forEach(step => {
              setTimeout(() => {
                setFlickerState(step.state);
              }, cumulativeDelay);
              cumulativeDelay += step.delay;
            });
            
            // Finally set to visible after sequence completes
            setTimeout(() => {
              setVisible(true);
            }, cumulativeDelay);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, [delay, visible, intensity, duration]);

  // Map flickerState to visual styles
  const getOpacity = () => {
    if (!visible) {
      switch(flickerState) {
        case 0: return 'opacity-0';
        case 1: return 'opacity-20';
        case 2: return 'opacity-40';
        case 3: return 'opacity-60';
        case 4: return 'opacity-80';
        case 5: return 'opacity-100';
        default: return 'opacity-0';
      }
    }
    return 'opacity-100';
  };

  // Get any distortion effects based on flicker state
  const getDistortion = () => {
    // Don't apply any distortion to title flickering
    if (intensity === 'title') {
      return '';
    }
    
    if (!visible && intensity === 'strong') {
      switch(flickerState) {
        case 1: return 'scale-[1.02] blur-[0.5px]';
        case 2: return 'scale-[0.99] blur-[0.2px]';
        case 3: return 'scale-[1.01]';
        case 4: return 'scale-[0.995]';
        default: return '';
      }
    }
    return '';
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-50 ${getOpacity()} ${getDistortion()} ${className}`}
    >
      {children}
    </div>
  );
};

const AnimatedBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-0 overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'radial-gradient(black 1px, transparent 0)', 
             backgroundSize: '40px 40px',
             transform: `translateY(${scrollY * 0.05}px)` 
           }}>
      </div>
      
      {/* Minimal gradients with parallax effect */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[70%] h-[50%] rounded-full bg-black/[0.02] blur-[80px]" 
        style={{ transform: `translate(${scrollY * 0.02}px, ${scrollY * -0.01}px)` }}
      ></div>
      <div 
        className="absolute top-[60%] -right-[5%] w-[50%] h-[60%] rounded-full bg-black/[0.02] blur-[100px]"
        style={{ transform: `translate(${scrollY * -0.03}px, ${scrollY * 0.02}px)` }}
      ></div>
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
        <ParallaxSection speed={0.05} className="min-h-screen">
          <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <FlickerIn intensity="title">
                <div className="space-y-2 mb-6">
                  <p className="uppercase tracking-widest text-xs font-medium">Drop #39</p>
                  <h1 className="text-7xl md:text-9xl font-bold tracking-tight">
                    Not-A-Mac
                  </h1>
                </div>
              </FlickerIn>
              
              <FlickerIn delay={900} intensity="normal">
                <p className="text-lg md:text-xl text-black/70 max-w-lg mx-auto mb-12 font-light">
                  A minimalist desk accessory that elegantly displays and controls your music
                </p>
              </FlickerIn>
              
              {/* Countdown */}
              <FlickerIn delay={1200} intensity="normal">
                <div className="inline-flex space-x-6 mb-16">
                  <CountdownItem value={timeLeft.days} label="Days" />
                  <CountdownSeparator />
                  <CountdownItem value={timeLeft.hours} label="Hours" />
                  <CountdownSeparator />
                  <CountdownItem value={timeLeft.minutes} label="Mins" />
                  <CountdownSeparator />
                  <CountdownItem value={timeLeft.seconds} label="Secs" />
                </div>
              </FlickerIn>
              
              <FlickerIn delay={1500} intensity="normal">
                <div>
                  <a href="/setup" 
                    className="inline-block px-8 py-3 border border-black transition-all duration-300 hover:bg-black hover:text-white">
                    Setup Your Device
                  </a>
                </div>
              </FlickerIn>
            </div>
            
            <button 
              onClick={scrollToNextSection}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-black/50 hover:text-black transition-all duration-300 animation-pulse"
            >
              <ArrowDown className="w-8 h-8" />
            </button>
          </section>
        </ParallaxSection>

        {/* Features Section */}
        <section id="features" className="relative py-24 px-4 bg-black text-white">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-20">
                <p className="uppercase tracking-widest text-xs font-medium text-white/70 mb-2">Features</p>
                <h2 className="text-3xl md:text-4xl font-light">Thoughtfully Designed</h2>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
              {Object.keys(featureDetails).map((key, index) => (
                <FadeIn key={key} delay={index * 150}>
                  <div>
                    <FeatureItem 
                      id={key}
                      icon={featureDetails[key].icon}
                      title={featureDetails[key].title}
                      description={featureDetails[key].description}
                      onClick={() => setActiveFeature(key)}
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Feature Modal */}
          {activeFeature && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div 
                className="bg-white text-black max-w-xl w-full p-8 relative animate-modalEnter"
                onClick={(e) => e.stopPropagation()}
              >
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
        <ParallaxSection speed={-0.05}>
          <section id="product" className="relative py-24 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="text-center mb-16">
                  <p className="uppercase tracking-widest text-xs font-medium text-black/70 mb-2">Collection</p>
                  <h2 className="text-3xl md:text-5xl font-light mb-8">Elevate your space</h2>
                  <p className="text-black/70 text-lg max-w-2xl mx-auto leading-relaxed">
                    A fusion of cutting-edge eco-tech and minimalist design, Not-A-Mac elevates your space while providing 
                    seamless music control. Limited edition, thoughtfully crafted.
                  </p>
                </div>
              </FadeIn>

              <div className="space-y-32">
                {/* Marble Product */}
                <FadeIn>
                  <div className="flex items-center justify-between gap-16">
                    <div className="w-1/2">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src="/marble_nam.jpeg" 
                          alt="Marble Not-A-Mac" 
                          fill
                          className="object-contain"
                          priority
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                        />
                      </div>
                    </div>
                    <div className="w-1/2 space-y-6">
                      <p className="text-sm font-medium text-black/60">No. 001</p>
                      <h3 className="text-4xl font-light">Marble</h3>
                      <p className="text-black/70 leading-relaxed">
                        Crafted from premium recycled materials, the Marble edition brings a touch of classic elegance to your workspace. 
                        Its subtle patterns and textures make each piece uniquely yours.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Ivory Product */}
                <FadeIn>
                  <div className="flex items-center justify-between gap-16">
                    <div className="w-1/2">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src="/ivory_nam.png" 
                          alt="Ivory Not-A-Mac" 
                          fill
                          className="object-contain"
                          priority
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                        />
                      </div>
                    </div>
                    <div className="w-1/2 space-y-6">
                      <p className="text-sm font-medium text-black/60">No. 002</p>
                      <h3 className="text-4xl font-light">Ivory</h3>
                      <p className="text-black/70 leading-relaxed">
                        The Ivory edition embodies minimalist perfection with its clean lines and pure form. 
                        Its warm, neutral tone complements any environment while maintaining a strong presence.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Sakura Product */}
                <FadeIn>
                  <div className="flex items-center justify-between gap-16">
                    <div className="w-1/2">
                      <div className="relative w-full aspect-square">
                        <Image 
                          src="/sakura_nam.jpeg" 
                          alt="Sakura Not-A-Mac" 
                          fill
                          className="object-contain"
                          priority
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                        />
                      </div>
                    </div>
                    <div className="w-1/2 space-y-6">
                      <p className="text-sm font-medium text-black/60">No. 003</p>
                      <h3 className="text-4xl font-light">Sakura</h3>
                      <p className="text-black/70 leading-relaxed">
                        Inspired by Japanese cherry blossoms, the Sakura edition brings a gentle touch of nature to your desk. 
                        Its soft pink hue creates a calming atmosphere in any space.
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </div>

              <div className="max-w-lg mx-auto mt-24">
                <div className="space-y-6">
                  <StatItem label="Production" value="100% Eco-Friendly" />
                  <StatItem label="Availability" value="May 2025" />
                </div>
              </div>
            </div>
          </section>
        </ParallaxSection>

        {/* Manifesto */}
        <ParallaxSection speed={0.1}>
          <section id="manifesto" className="relative py-24 px-4 bg-black text-white">
            <div className="max-w-3xl mx-auto text-center">
              <FlickerIn>
                <p className="text-2xl md:text-3xl font-light leading-relaxed">
                  &ldquo;Be what you could be.&rdquo;
                </p>
              </FlickerIn>
              <FlickerIn delay={600}>
                <p className="mt-8 text-sm text-white/60 uppercase tracking-widest">
                  Not-A-Mac Manifesto
                </p>
              </FlickerIn>
            </div>
          </section>
        </ParallaxSection>

        {/* Footer */}
        <footer id="footer" className="relative py-12 px-4 border-t border-black/10 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <FadeIn>
                <div>
                  <p className="text-sm font-medium mb-3">Not-A-Mac</p>
                  <p className="text-sm text-black/60">
                    An aesthetic desk accessory for music lovers and design enthusiasts.
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={200}>
                <div>
                  <p className="text-sm font-medium mb-3">Links</p>
                  <div className="space-y-2">
                    <p><a href="#" className="text-sm text-black/60 hover:text-black">Setup Device</a></p>
                    <p><a href="#" className="text-sm text-black/60 hover:text-black">Support</a></p>
                    <p><a href="#" className="text-sm text-black/60 hover:text-black">Privacy Policy</a></p>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={400}>
                <div>
                  <p className="text-sm font-medium mb-3">Connect</p>
                  <p className="text-sm text-black/60">
                    For inquiries, please email us at hello@notamac.com
                  </p>
                </div>
              </FadeIn>
            </div>
            <div className="pt-10 border-t border-black/10 text-center">
              <p className="text-xs text-black/50">© 2025 Not-A-Mac. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s ease-out forwards;
        }
        
        /* Make sure product animation container is visible initially */
        .product-animation-container {
          opacity: 1;
          transform: none;
          filter: none;
        }
        
        /* Gift box animations */
        .gift-box-lid {
          opacity: 0;
          transform: translate(-50%, 0) rotateX(0deg);
          transform-origin: center bottom;
        }
        
        .fade-in-visible .gift-box-lid {
          animation: openLid 1.5s ease-in-out forwards;
        }
        
        @keyframes openLid {
          0% { transform: translate(-50%, 0) rotateX(0deg); opacity: 1; }
          50% { transform: translate(-50%, -50px) rotateX(-60deg); opacity: 0.7; }
          100% { transform: translate(-50%, -100px) rotateX(-90deg); opacity: 0; }
        }
        
        /* Pillar animations */
        .pillar {
          transform: translateY(100%);
          opacity: 0;
        }
        
        .fade-in-visible .pillar {
          animation: risePillar 1.5s ease-out forwards;
          animation-delay: 0.7s;
        }
        
        @keyframes risePillar {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        /* Product image animations */
        .product-image {
          opacity: 0;
          transform: translateY(0);
          background: transparent;
        }
        
        .fade-in-visible .product-image {
          animation: floatProduct 3s ease-out forwards, bobUpDown 3s ease-in-out infinite;
          animation-delay: 1.7s, 4.7s;
        }
        
        .fade-in-visible .ivory-product {
          animation-delay: 1.9s, 4.9s;
        }
        
        .fade-in-visible .sakura-product {
          animation-delay: 2.1s, 5.1s;
        }
        
        @keyframes floatProduct {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bobUpDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
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