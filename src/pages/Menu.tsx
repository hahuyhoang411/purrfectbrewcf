
import { Coffee, Croissant, Cookie, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';

const Menu = () => {
  const menuCategories = [
    {
      title: 'Coffee & Espresso',
      icon: Coffee,
      items: [
        { name: 'Purrfect Espresso', description: 'Rich, smooth espresso shot', price: '$3.50' },
        { name: 'Whiskers Cappuccino', description: 'Creamy cappuccino with cat latte art', price: '$4.75' },
        { name: 'Tabby Latte', description: 'Smooth latte with your choice of milk', price: '$5.25' },
        { name: 'Calico Cold Brew', description: 'Smooth cold brew served over ice', price: '$4.50' },
        { name: 'Maine Coon Mocha', description: 'Rich chocolate and espresso blend', price: '$5.75' },
        { name: 'Siamese Macchiato', description: 'Espresso marked with steamed milk foam', price: '$4.95' },
      ]
    },
    {
      title: 'Specialty Drinks',
      icon: Sparkles,
      items: [
        { name: 'Catnip Chai Latte', description: 'Spiced chai with steamed milk and honey', price: '$5.50' },
        { name: 'Persian Hot Chocolate', description: 'Rich cocoa with whipped cream', price: '$4.75' },
        { name: 'Bengal Matcha Latte', description: 'Premium matcha with steamed milk', price: '$5.95' },
        { name: 'Ragdoll Turmeric Latte', description: 'Golden turmeric with warming spices', price: '$5.25' },
        { name: 'Manx Mint Tea', description: 'Refreshing peppermint herbal tea', price: '$3.75' },
        { name: 'Scottish Fold Earl Grey', description: 'Classic Earl Grey with bergamot', price: '$3.95' },
      ]
    },
    {
      title: 'Fresh Pastries',
      icon: Croissant,
      items: [
        { name: 'Paw Print Croissant', description: 'Buttery croissant with almond filling', price: '$4.25' },
        { name: 'Kitty Cat Scone', description: 'Blueberry scone with clotted cream', price: '$3.95' },
        { name: 'Tuna Melt Sandwich', description: 'Grilled sandwich with premium tuna', price: '$8.50' },
        { name: 'Salmon Bagel', description: 'Everything bagel with cream cheese and salmon', price: '$9.75' },
        { name: 'Cat Grass Salad', description: 'Fresh greens with herb vinaigrette', price: '$7.50' },
        { name: 'Meow Mix Wrap', description: 'Veggie wrap with hummus and sprouts', price: '$6.95' },
      ]
    },
    {
      title: 'Sweet Treats',
      icon: Cookie,
      items: [
        { name: 'Whisker Cookies', description: 'Cat-shaped sugar cookies (pack of 3)', price: '$4.50' },
        { name: 'Purrfect Cheesecake', description: 'Creamy cheesecake with berry compote', price: '$6.75' },
        { name: 'Tabby Tiramisu', description: 'Classic tiramisu with coffee essence', price: '$7.25' },
        { name: 'Cat Cupcake', description: 'Vanilla cupcake with cream cheese frosting', price: '$4.95' },
        { name: 'Feline Fudge Brownie', description: 'Rich chocolate brownie with walnuts', price: '$5.50' },
        { name: 'Purr-fait Parfait', description: 'Yogurt parfait with granola and berries', price: '$6.25' },
      ]
    }
  ];

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
              We offer dairy-free milk alternatives (oat, almond, soy) and gluten-free pastries. 
              Our cats are also on special diets - please don't feed them human food!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                Vegan Options
              </span>
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                Gluten-Free
              </span>
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                Dairy-Free
              </span>
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                Sugar-Free
              </span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Menu;
