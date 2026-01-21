/**
 * Mapping of category IDs to their image paths
 */
export const getCategoryImage = (categoryId: string): any => {
  const imageMap: Record<string, any> = {
    'cars': require('@/assets/images/categories/cars.png'),
    'motorbikes': require('@/assets/images/categories/motorbike.png'),
    'car-parts': require('@/assets/images/categories/car-parts.png'),
    'van-light-commercials': require('@/assets/images/categories/van.png'),
    'car-extras': require('@/assets/images/categories/car-extras.png'),
    'coaches-buses': require('@/assets/images/categories/coaches-buses.png'),
    'modified-cars': require('@/assets/images/categories/modified-cars.png'),
    'motorbike-extras': require('@/assets/images/categories/motorbike-extras.png'),
    'vintage-cars': require('@/assets/images/categories/vintage-cars.png'),
    'breakings-repairables': require('@/assets/images/categories/breakings-repairables.png'),
    'rally-cars': require('@/assets/images/categories/rally-cars.png'),
    'trucks': require('@/assets/images/categories/truck.png'),
    'vintage-bikes': require('@/assets/images/categories/vintage.png'),
    'campers': require('@/assets/images/categories/campers.png'),
    'moped': require('@/assets/images/categories/moped.png'),
    'new-car': require('@/assets/images/categories/new-car.png'),
    'dealerships': require('@/assets/images/categories/dealerships.png'),
  };

  return imageMap[categoryId] || null;
};
