import { useState, useEffect } from 'react';

export default function Carousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
            title: "Luxury Sneaker Collection",
            subtitle: "Elevate Your Style"
        },
        {
            image: "https://images.unsplash.com/photo-1508252568242-e0f383f753d6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Premium Craftsmanship",
            subtitle: "Exclusive Limited Editions"
        },
        {
            image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80",
            title: "Timeless Design",
            subtitle: "Modern Classics"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-luxury-dark">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80 z-10" />
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
                        <h2 className="text-5xl font-serif text-white mb-4 drop-shadow-lg [text-shadow:_2px_2px_0_rgb(0_0_0_/_80%),_-2px_-2px_0_rgb(0_0_0_/_80%),_4px_4px_0_rgb(0_0_0_/_50%)]">{slide.title}</h2>
                        <p className="text-2xl text-white font-light max-w-3xl [text-shadow:_1px_1px_0_rgb(0_0_0_/_80%),_-1px_-1px_0_rgb(0_0_0_/_80%),_2px_2px_0_rgb(0_0_0_/_50%)]">{slide.subtitle}</p>
                    </div>
                </div>
            ))}
            
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-luxury-gold hover:text-luxury-light transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-luxury-gold hover:text-luxury-light transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentSlide ? 'bg-luxury-gold' : 'bg-luxury-light/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}