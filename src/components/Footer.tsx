
import { Coffee, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-foreground text-primary p-2 rounded-full">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl font-serif">Purrfect Brew</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Where coffee meets cuddles. Enjoy premium coffee while spending time with our adorable rescue cats looking for their forever homes.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg font-serif">Visit Us</h3>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Whiskers Avenue<br />Cattown, CT 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(555) 123-PURR</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>hello@purrfectbrew.com</span>
              </div>
            </div>
          </div>

          {/* Hours & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg font-serif">Hours & Social</h3>
            <div className="text-sm text-primary-foreground/80 space-y-1">
              <p>Monday - Friday: 7:00 AM - 8:00 PM</p>
              <p>Saturday: 8:00 AM - 9:00 PM</p>
              <p>Sunday: 8:00 AM - 7:00 PM</p>
            </div>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2024 Purrfect Brew Cat Café. All rights reserved. Made with ❤️ for cats and coffee lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
