
import { Coffee, Croissant, Cookie, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { MENU_CATEGORIES, DIETARY_OPTIONS } from '../data/cafeData';

const Menu = () => {
  // Use centralized menu data with icon mapping
  const menuCategories = MENU_CATEGORIES.map(categoryData => {
    const iconMap: Record<string, any> = {
      'Coffee & Espresso': Coffee,
      'Specialty Drinks': Sparkles,
      'Fresh Pastries': Croissant,
      'Sweet Treats': Cookie,
    };
    
    return {
      title: categoryData.category,
      icon: iconMap[categoryData.category] || Coffee,
      items: categoryData.items
    };
  });

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent via-secondary to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">
              Our Menu
            </h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Delicious drinks and treats crafted with love, served alongside our adorable feline friends
            </p>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {menuCategories.map((category, categoryIndex) => (
              <div key={category.title} className="animate-slide-up">
                <div className="text-center mb-12">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <category.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary font-serif">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={item.name}
                      className="bg-card p-6 rounded-xl shadow-sm hover-lift border border-border"
                      style={{ animationDelay: `${itemIndex * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-primary font-serif">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-primary bg-accent px-3 py-1 rounded-full">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Note */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-accent rounded-2xl p-8 hover-lift">
            <h3 className="text-2xl font-bold text-primary mb-4 font-serif">
              Special Dietary Options
            </h3>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              {DIETARY_OPTIONS.join(', ')}. Our cats are also on special diets - please don't feed them human food!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {['Vegan Options', 'Gluten-Free', 'Dairy-Free', 'Sugar-Free'].map(option => (
                <span key={option} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Menu;
