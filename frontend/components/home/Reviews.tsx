import { MOCK_REVIEWS } from "@/lib/mock/reviews";
import Image from "next/image";

export default function Reviews() {
  return (
    <section id="reviews" className="relative scroll-mt-24 py-20 md:py-28 overflow-hidden bg-[#F5F5F5]">
      
      {/* Faded Background Automotive Image */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
        <Image
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury car background texture"
          fill
          className="object-cover object-center filter grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F5] via-transparent to-[#F5F5F5]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        
        {/* Header Area */}
        <div className="space-y-3 max-w-3xl">
          <p className="text-sm font-light uppercase tracking-widest text-[#E53E3E]">
            Testimonials
          </p>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900">
            What Buyers & Sellers <span className="font-normal text-[#E53E3E]">Say</span>
          </h2>

          <p className="text-base md:text-lg font-light text-gray-600 leading-relaxed pt-1">
            Real experiences from buyers and sellers using our marketplace to negotiate with clarity and close deals with confidence.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {MOCK_REVIEWS.map((review) => (
            <li
              key={review.id}
              className="flex flex-col justify-between rounded-3xl bg-white/80 p-8 backdrop-blur-md border border-gray-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white"
            >
              <div>
                {/* Star Ratings */}
                <p className="text-base tracking-widest text-[#E53E3E]">
                  {"★".repeat(review.rating)}
                  <span className="text-gray-300">
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </p>

                {/* Quote Text */}
                <blockquote className="mt-5 text-base md:text-lg font-light leading-relaxed text-gray-800">
                  “{review.quote}”
                </blockquote>
              </div>

              {/* Reviewer Details */}
              <div className="mt-8 border-t border-gray-200/60 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-900">
                    {review.name}
                  </p>
                  <p className="text-xs font-light tracking-wide text-gray-500 uppercase mt-0.5">
                    {review.city}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-[#E53E3E]/60" />
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}