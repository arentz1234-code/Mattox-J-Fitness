import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            MATTOX <span className="text-primary">J</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
            <Link href="/book" className="btn-primary text-sm">
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transform Your
                <span className="text-primary"> Fitness</span> Journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Personalized training programs designed to help you achieve your goals.
                Whether you&apos;re just starting or looking to reach new heights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book" className="btn-primary text-center">
                  Book a Consultation
                </Link>
                <a href="#about" className="btn-outline text-center">
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/mattox-hero.jpg"
                  alt="Mattox J - Personal Trainer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">About Mattox J</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dedicated to helping you become the best version of yourself
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/mattox-about.jpg"
                  alt="Mattox J at the gym"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Bio</h3>
                <p className="text-gray-600">
                  With a passion for fitness and helping others achieve their goals,
                  I specialize in creating customized training programs that fit your
                  lifestyle. My approach combines proven techniques with personalized
                  attention to help you get real, lasting results.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Training Philosophy</h3>
                <p className="text-gray-600">
                  Every body is different, and so should be every training program.
                  I believe in creating sustainable, enjoyable fitness routines that
                  fit your lifestyle and help you achieve lasting results. Train like
                  an athlete, feel like a champion.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">What I Offer</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Personalized workout plans
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Nutrition guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    One-on-one coaching
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Accountability & support
                  </li>
                </ul>
              </div>

              <Link href="/book" className="btn-primary inline-block">
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Training Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive training solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Weight Loss',
                description: 'Effective programs designed to help you shed pounds and keep them off through sustainable methods.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                ),
              },
              {
                title: 'Muscle Building',
                description: 'Strategic strength training to help you build lean muscle mass and improve your physique.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
              },
              {
                title: 'General Fitness',
                description: 'Balanced programs to improve your overall health, energy levels, and daily performance.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                ),
              },
            ].map((service) => (
              <div key={service.title} className="card p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {service.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Book a free consultation and let&apos;s discuss your fitness goals.
          </p>
          <Link href="/book" className="btn-primary text-lg px-8 py-4">
            Book a Consultation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xl font-bold text-white mb-4">
            MATTOX <span className="text-primary">J</span>
          </p>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Mattox J Personal Training. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
