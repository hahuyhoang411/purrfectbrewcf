
import { ArrowRight, Clock, Heart, Users, Coffee, Cat, Star, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CAFE_INFO } from '../data/cafeData';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent via-secondary to-muted py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=800&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-serif">
              Welcome to<br />
              <span className="text-5xl md:text-7xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {CAFE_INFO.name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Where premium coffee meets adorable cats. Relax, sip, and find your new best friend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/cats"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover-lift flex items-center space-x-2 group"
              >
                <Cat className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Meet Our Cats</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/menu"
                className="bg-card text-card-foreground border-2 border-primary px-8 py-4 rounded-full text-lg font-semibold hover-lift flex items-center space-x-2 group"
              >
                <Coffee className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span>View Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-serif">
                About {CAFE_INFO.name}
              </h2>
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                Our cozy cat café combines the love of premium coffee with the joy of feline companionship. 
                We're home to rescued cats looking for their forever families, and we believe every cup of 
                coffee tastes better with a purring friend nearby.
              </p>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                Whether you're a cat lover, coffee enthusiast, or both, our welcoming space offers the 
                perfect atmosphere to unwind, work, or simply enjoy some quality time with our furry residents.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">Rescue Cats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">Premium Coffee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-foreground/80">Community Space</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-accent to-secondary rounded-2xl p-8 hover-lift">
                <img
                  src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=400&fit=crop"
                  alt="Cozy cat in our café"
                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="bg-primary text-primary-foreground p-3 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Star className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-serif">
              Join Our Loyalty Program
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Earn points with every visit and redeem amazing rewards. Free coffee, treats, and exclusive cat experiences await!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-background rounded-xl p-6 text-center hover-lift">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Coffee className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Points</h3>
              <p className="text-foreground/80">Get 5 points for every dollar spent</p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center hover-lift">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Redeem Rewards</h3>
              <p className="text-foreground/80">Free drinks, pastries, and cat experiences</p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center hover-lift">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Cats</h3>
              <p className="text-foreground/80">Your visits help support our rescue cats</p>
            </div>
          </div>
          
          <div className="text-center">
            {user ? (
              <Link
                to="/loyalty"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover-lift inline-flex items-center space-x-2 group"
              >
                <Star className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span>View Your Rewards</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover-lift inline-flex items-center space-x-2 group"
              >
                <Star className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Join Now - It's Free!</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Hours Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="bg-primary text-primary-foreground p-3 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Clock className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 font-serif">
              Visit Us Anytime
            </h2>
            <div className="bg-background rounded-2xl p-8 shadow-lg hover-lift max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {Object.entries(CAFE_INFO.hours).map(([day, hours]) => (
                  <div key={day}>
                    <h3 className="font-semibold text-lg text-primary mb-3 font-serif">
                      {day.includes('-') ? 'Weekdays' : day}
                    </h3>
                    <div className="space-y-2 text-foreground/80">
                      <p>{day}</p>
                      <p className="font-medium text-lg">{hours}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-foreground/60">
                  *Last orders 30 minutes before closing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
