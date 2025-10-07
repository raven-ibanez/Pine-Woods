import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-pine-cream to-pine-sand py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-rustic font-semibold text-pine-forest mb-6 animate-fade-in">
          Nature's Paradise, Adventure Awaits
          <span className="block text-pine-sage mt-2">Pine Woods Campsite & Beach Resort</span>
        </h1>
        <p className="text-xl text-pine-bark mb-8 max-w-2xl mx-auto animate-slide-up">
          Experience the perfect blend of forest camping and beach relaxation in our natural paradise.
        </p>
        <div className="flex justify-center">
          <a 
            href="#menu"
            className="bg-pine-forest text-white px-8 py-3 rounded-full hover:bg-pine-sage transition-all duration-300 transform hover:scale-105 font-medium"
          >
            Explore Our Services
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;