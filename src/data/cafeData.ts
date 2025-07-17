// Central data source for café information
// This ensures consistency across all components

export const CAFE_INFO = {
  name: "Purrfect Brew",
  address: "123 Cat Street, Coffee City, CC 12345",
  phone: "(555) 123-PURR",
  email: "adoptions@purrfectbrew.com",
  hours: {
    "Monday - Friday": "7:00 AM - 8:00 PM",
    "Saturday": "8:00 AM - 9:00 PM",
    "Sunday": "8:00 AM - 7:00 PM"
  }
} as const;

export const MENU_CATEGORIES = [
  {
    category: "Coffee & Espresso",
    items: [
      { name: "Purrfect Espresso", description: "Rich, smooth espresso shot", price: "$3.50" },
      { name: "Whiskers Cappuccino", description: "Creamy cappuccino with cat latte art", price: "$4.75" },
      { name: "Tabby Latte", description: "Smooth latte with your choice of milk", price: "$5.25" },
      { name: "Calico Cold Brew", description: "Smooth cold brew served over ice", price: "$4.50" },
      { name: "Maine Coon Mocha", description: "Rich chocolate and espresso blend", price: "$5.75" },
      { name: "Siamese Macchiato", description: "Espresso marked with steamed milk foam", price: "$4.95" }
    ]
  },
  {
    category: "Specialty Drinks",
    items: [
      { name: "Catnip Chai Latte", description: "Spiced chai with steamed milk and honey", price: "$5.50" },
      { name: "Persian Hot Chocolate", description: "Rich cocoa with whipped cream", price: "$4.75" },
      { name: "Bengal Matcha Latte", description: "Premium matcha with steamed milk", price: "$5.95" },
      { name: "Ragdoll Turmeric Latte", description: "Golden turmeric with warming spices", price: "$5.25" },
      { name: "Manx Mint Tea", description: "Refreshing peppermint herbal tea", price: "$3.75" },
      { name: "Scottish Fold Earl Grey", description: "Classic Earl Grey with bergamot", price: "$3.95" }
    ]
  },
  {
    category: "Fresh Pastries",
    items: [
      { name: "Paw Print Croissant", description: "Buttery croissant with almond filling", price: "$4.25" },
      { name: "Kitty Cat Scone", description: "Blueberry scone with clotted cream", price: "$3.95" },
      { name: "Tuna Melt Sandwich", description: "Grilled sandwich with premium tuna", price: "$8.50" },
      { name: "Salmon Bagel", description: "Everything bagel with cream cheese and salmon", price: "$9.75" },
      { name: "Cat Grass Salad", description: "Fresh greens with herb vinaigrette", price: "$7.50" },
      { name: "Meow Mix Wrap", description: "Veggie wrap with hummus and sprouts", price: "$6.95" }
    ]
  },
  {
    category: "Sweet Treats",
    items: [
      { name: "Whisker Cookies", description: "Cat-shaped sugar cookies (pack of 3)", price: "$4.50" },
      { name: "Purrfect Cheesecake", description: "Creamy cheesecake with berry compote", price: "$6.75" },
      { name: "Tabby Tiramisu", description: "Classic tiramisu with coffee essence", price: "$7.25" },
      { name: "Cat Cupcake", description: "Vanilla cupcake with cream cheese frosting", price: "$4.95" },
      { name: "Feline Fudge Brownie", description: "Rich chocolate brownie with walnuts", price: "$5.50" },
      { name: "Purr-fait Parfait", description: "Yogurt parfait with granola and berries", price: "$6.25" }
    ]
  }
] as const;

export const CATS = [
  {
    id: 1,
    name: "Luna",
    age: "2 years",
    breed: "Grey Tabby",
    personality: "Playful and curious",
    funFact: "Loves to play with feather toys and purrs when you read to her",
    adoptable: true,
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Mochi",
    age: "4 years", 
    breed: "Orange Tabby",
    personality: "Laid-back and affectionate",
    funFact: "Resident greeter who welcomes every customer with head bumps",
    adoptable: false,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Shadow",
    age: "3 years",
    breed: "Black Shorthair",
    personality: "Mysterious and gentle", 
    funFact: "Appears wherever there's a sunny spot and loves afternoon naps",
    adoptable: true,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop"
  },
  {
    id: 4,
    name: "Biscuit",
    age: "1 year",
    breed: "Calico",
    personality: "Energetic and social",
    funFact: "Loves to 'help' customers work on their laptops by walking across keyboards",
    adoptable: true,
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop"
  },
  {
    id: 5,
    name: "Sage",
    age: "5 years",
    breed: "Russian Blue",
    personality: "Wise and calm",
    funFact: "Senior cat who gives the best cuddles and supervises the younger cats",
    adoptable: true,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop"
  },
  {
    id: 6,
    name: "Pepper",
    age: "2 years",
    breed: "Tuxedo",
    personality: "Dignified and playful",
    funFact: "Wears his black and white coat like a formal tuxedo and sits like a proper gentleman",
    adoptable: true,
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop"
  }
] as const;

export const HOUSE_RULES = [
  "Please let cats approach you first - no grabbing or chasing",
  "Don't feed the cats human food (they have special diets!)",
  "Wash hands before and after interacting with cats",
  "Children under 12 must be supervised by adults",
  "Please keep voices low to maintain a relaxing atmosphere",
  "No flash photography - it startles our feline friends",
  "If a cat is sleeping, please don't disturb them"
] as const;

export const CURRENT_PROMOTIONS = [
  "Happy Hour: 20% off all drinks Monday-Friday 3-5 PM",
  "Cat Adoption Special: Free coffee for a month when you adopt one of our cats",
  "Student Discount: 15% off with valid student ID"
] as const;

export const DIETARY_OPTIONS = [
  "Dairy-free milk alternatives (oat, almond, soy)",
  "Gluten-free pastries available",
  "Vegan options clearly marked",
  "Sugar-free alternatives for select items"
] as const;