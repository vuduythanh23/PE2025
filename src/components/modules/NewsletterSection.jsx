import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setEmail("");
      setIsLoading(false);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }, 1000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-luxury-gold via-yellow-400 to-amber-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {" "}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-serif text-black mb-4">
            Subscribe to Newsletter
          </h2>
          <p className="text-xl text-black/80 max-w-2xl mx-auto">
            Be the first to know about new collections, special offers, and the
            hottest fashion trends
          </p>
        </div>
        {isSubscribed ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Thank you for subscribing! We'll send you the latest news to your
              email.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 text-gray-800 bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-black text-luxury-gold font-serif text-lg tracking-wider hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300 transform hover:scale-105 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>{" "}
                    Subscribing...
                  </div>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
            <p className="mt-4 text-black/60 text-sm">
              We respect your privacy. You can unsubscribe at any time.
            </p>
          </form>
        )}
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {" "}
          {[
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 0v1m0 0V7a2 2 0 11-2 0v1zm-2 0H8m0 0v8a2 2 0 11-2 0V6a2 2 0 112 0v1zm2 0h2m0 0V7a2 2 0 11-2 0v1zm0 0v1"
                  />
                </svg>
              ),
              title: "Exclusive Offers",
              description: "Special discounts only for members",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              title: "Latest News",
              description: "Updates on new products and hot trends",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              ),
              title: "Style Guide",
              description: "Tips and tricks from fashion experts",
            },
          ].map((benefit, index) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center text-black mb-4">
                {benefit.icon}
              </div>
              <h3 className="font-serif text-lg text-black mb-2">
                {benefit.title}
              </h3>
              <p className="text-black/70 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
