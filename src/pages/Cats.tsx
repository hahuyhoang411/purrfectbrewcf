
import { Heart, Calendar, Star, Home } from 'lucide-react';
import Layout from '../components/Layout';

const Cats = () => {
  const cats = [
    {
      id: 1,
      name: 'Luna',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop',
      age: '2 years',
      breed: 'Grey Tabby',
      personality: 'Playful and curious',
      funFact: 'Loves to play with feather toys and purrs when you read to her',
      adoptable: true,
      color: 'from-blue-100 to-purple-100'
    },
    {
      id: 2,
      name: 'Mochi',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
      age: '4 years',
      breed: 'Orange Tabby',
      personality: 'Laid-back and affectionate',
      funFact: 'Resident greeter who welcomes every customer with head bumps',
      adoptable: false,
      color: 'from-orange-100 to-yellow-100'
    },
    {
      id: 3,
      name: 'Shadow',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
      age: '3 years',
      breed: 'Black Shorthair',
      personality: 'Mysterious and gentle',
      funFact: 'Appears wherever there\'s a sunny spot and loves afternoon naps',
      adoptable: true,
      color: 'from-gray-100 to-slate-100'
    },
    {
      id: 4,
      name: 'Biscuit',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop',
      age: '1 year',
      breed: 'Calico',
      personality: 'Energetic and social',
      funFact: 'Loves to "help" customers work on their laptops by walking across keyboards',
      adoptable: true,
      color: 'from-pink-100 to-rose-100'
    },
    {
      id: 5,
      name: 'Sage',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
      age: '5 years',
      breed: 'Russian Blue',
      personality: 'Wise and calm',
      funFact: 'Senior cat who gives the best cuddles and supervises the younger cats',
      adoptable: true,
      color: 'from-teal-100 to-cyan-100'
    },
    {
      id: 6,
      name: 'Pepper',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop',
      age: '2 years',
      breed: 'Tuxedo',
      personality: 'Dignified and playful',
      funFact: 'Wears his black and white coat like a formal tuxedo and sits like a proper gentleman',
      adoptable: true,
      color: 'from-indigo-100 to-blue-100'
    }
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent via-secondary to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">
              Meet Our Cats
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Get to know our adorable residents who are looking for their forever homes
            </p>
          </div>
        </div>
      </section>

      {/* Cats Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cats.map((cat, index) => (
              <div 
                key={cat.id}
                className="bg-card rounded-2xl overflow-hidden shadow-sm hover-lift border border-border animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Cat Image */}
                <div className="relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {cat.adoptable ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>Available</span>
                      </div>
                    ) : (
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Home className="h-3 w-3" />
                        <span>Resident</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cat Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-primary font-serif">
                      {cat.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-foreground/60">
                      <Calendar className="h-4 w-4" />
                      <span>{cat.age}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-sm font-medium text-primary">Breed:</span>
                      <span className="text-sm text-foreground/80 ml-2">{cat.breed}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-primary">Personality:</span>
                      <span className="text-sm text-foreground/80 ml-2">{cat.personality}</span>
                    </div>
                  </div>

                  <div className="bg-accent/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-primary">Fun Fact:</span>
                        <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                          {cat.funFact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cat.adoptable && (
                    <button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover-lift transition-all duration-300 flex items-center justify-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>Interested in Adopting</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adoption Info */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-accent rounded-2xl p-8 hover-lift">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-serif">
              Interested in Adoption?
            </h3>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              All our cats are rescued and looking for loving forever homes. We work with local 
              animal shelters to ensure proper vetting and matching. Come spend time with them 
              during your visit!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full">
                📧 adoptions@purrfectbrew.com
              </div>
              <div className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full">
                📞 (555) 123-PURR
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cats;
