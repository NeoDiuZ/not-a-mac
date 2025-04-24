"use client";
import React, { useState } from 'react';
import { Music, MailIcon, UserIcon, MapPinIcon, PaletteIcon, ArrowRight, CheckCircle } from 'lucide-react';

export default function Waitlist() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    color: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const colorOptions = [
    { 
      value: 'marble', 
      label: 'Marble', 
      bgColor: 'bg-gray-200', 
      borderColor: 'border-gray-300',
      hasImage: true, 
      imagePath: "/images/marble-colour.jpeg" /* Path for the uploaded image */
    },
    { value: 'ivory', label: 'Ivory', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
    { value: 'sakura', label: 'Sakura', bgColor: 'bg-pink-200', borderColor: 'border-pink-300' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      
      // Show success message
      setSuccess(true);
      // Reset form
      setFormData({
        email: '',
        name: '',
        color: '',
        address: ''
      });
      
    } catch (err) {
      console.error('Error submitting to waitlist:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute w-[40vw] h-[40vw] rounded-full bg-black/[0.02] blur-[80px]"
          style={{ left: '10%', top: '10%' }}></div>
        <div className="absolute w-[45vw] h-[45vw] rounded-full bg-black/[0.02] blur-[100px]"
          style={{ right: '15%', top: '30%' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto border border-black/10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Music className="w-6 h-6 text-black" />
              <h1 className="text-3xl font-bold">Join Waitlist</h1>
            </div>
            <p className="text-black/80 mb-4">
              Get early access to Not-A-Mac
            </p>
          </div>
          
          {/* Checkout-like price display */}
          <div className="mb-8 border border-gray-200 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Not-A-Mac Device</span>
              <span className="font-medium">SGD 50.00</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 pb-2 border-b border-gray-200">
              <span>Early Bird Pricing</span>
              <span>-SGD 10.00</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm text-gray-500 border-b border-gray-200">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 font-semibold">
              <span>Total</span>
              <span>SGD 40.00</span>
            </div>
          </div>

          {success ? (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Thank You!</h3>
              <p className="text-green-700">
                You've been added to our waitlist. We'll notify you when access becomes available.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black/80 mb-1">
                    Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                      className="block w-full pl-10 py-3 px-4 rounded-lg bg-white/70 border border-black/20 focus:border-black/60 focus:ring-1 focus:ring-black/30 focus:outline-none shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black/80 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      className="block w-full pl-10 py-3 px-4 rounded-lg bg-white/70 border border-black/20 focus:border-black/60 focus:ring-1 focus:ring-black/30 focus:outline-none shadow-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-3">
                    Colour Selection *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {colorOptions.map((option) => (
                      <div 
                        key={option.value}
                        onClick={() => handleColorSelect(option.value)}
                        className={`cursor-pointer flex flex-col items-center transition-all duration-200 ${
                          formData.color === option.value ? 'scale-105' : 'hover:scale-105'
                        }`}
                      >
                        <div className={`relative w-full aspect-video rounded-lg overflow-hidden ${
                          option.hasImage ? '' : option.bgColor
                        } ${option.borderColor} border-2 mb-2 ${
                          formData.color === option.value ? 'ring-2 ring-black ring-offset-1' : ''
                        }`}>
                          {option.hasImage && (
                            <div className="absolute inset-0">
                              <img
                                src={option.imagePath}
                                alt={option.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {formData.color === option.value && (
                            <div className="absolute top-1 right-1 z-10">
                              <CheckCircle className="w-5 h-5 text-black" />
                            </div>
                          )}
                        </div>
                        <span className={`text-sm ${formData.color === option.value ? 'font-medium' : ''}`}>
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {formData.color === '' && error && <p className="mt-2 text-red-600 text-xs">Please select a colour</p>}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-black/80 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Your shipping address"
                      required
                      className="block w-full pl-10 py-3 px-4 rounded-lg bg-white/70 border border-black/20 focus:border-black/60 focus:ring-1 focus:ring-black/30 focus:outline-none shadow-sm min-h-[100px]"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.color === ''}
                className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-black/80 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-black/50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Join Waitlist</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-black/70 text-sm">
        <p>© 2025 Not-A-Mac. All rights reserved.</p>
      </footer>
    </div>
  );
} 