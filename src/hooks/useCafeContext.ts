import { CAFE_INFO, MENU_CATEGORIES, CATS, HOUSE_RULES, CURRENT_PROMOTIONS, DIETARY_OPTIONS } from '../data/cafeData';

/**
 * Custom hook that provides structured café context for the chatbot
 * This ensures the chatbot always has up-to-date information from our central data source
 */
export const useCafeContext = () => {
  // Generate dynamic context string for the chatbot
  const generateContextString = (): string => {
    const menuText = MENU_CATEGORIES.map(category => 
      `${category.category}:\n${category.items.map(item => 
        `- ${item.name}: ${item.description} (${item.price})`
      ).join('\n')}`
    ).join('\n\n');

    const catsText = CATS.map(cat => 
      `${cat.name} (${cat.breed}, ${cat.age}): ${cat.personality}. ${cat.funFact} ${cat.adoptable ? '- Available for adoption!' : '- Permanent resident'}`
    ).join('\n');

    const hoursText = Object.entries(CAFE_INFO.hours).map(([day, hours]) => 
      `${day}: ${hours}`
    ).join('\n');

    const rulesText = HOUSE_RULES.map(rule => `- ${rule}`).join('\n');
    const promotionsText = CURRENT_PROMOTIONS.map(promo => `- ${promo}`).join('\n');
    const dietaryText = DIETARY_OPTIONS.map(option => `- ${option}`).join('\n');

    return `📍 Location & Hours:
${CAFE_INFO.name}
${CAFE_INFO.address}
${hoursText}
*Last orders 30 minutes before closing

🍽️ Our Menu:
${menuText}

🐱 Our Cats:
${catsText}

📋 House Rules:
${rulesText}

💰 Current Promotions:
${promotionsText}

🥛 Dietary Options:
${dietaryText}

📞 Contact Info:
- Phone: ${CAFE_INFO.phone}
- Email: ${CAFE_INFO.email}`;
  };

  return {
    cafeInfo: CAFE_INFO,
    menuCategories: MENU_CATEGORIES,
    cats: CATS,
    houseRules: HOUSE_RULES,
    promotions: CURRENT_PROMOTIONS,
    dietaryOptions: DIETARY_OPTIONS,
    generateContextString
  };
};