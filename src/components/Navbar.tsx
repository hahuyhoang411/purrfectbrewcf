
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Coffee, Star, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Our Cats', path: '/cats' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary text-primary-foreground p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-primary font-serif">Purrfect Brew</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-primary bg-accent'
                    : 'text-foreground hover:text-primary hover:bg-accent/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/loyalty"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    isActive('/loyalty')
                      ? 'text-primary bg-accent'
                      : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  <span>Loyalty</span>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Loyalty Member
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/loyalty" className="cursor-pointer">
                        <Star className="mr-2 h-4 w-4" />
                        <span>Loyalty Program</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2 rounded-md transition-colors duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive(link.path)
                      ? 'text-primary bg-accent'
                      : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {user ? (
                <>
                  <Link
                    to="/loyalty"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isActive('/loyalty')
                        ? 'text-primary bg-accent'
                        : 'text-foreground hover:text-primary hover:bg-accent/50'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span>Loyalty</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 transition-colors duration-300 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
