import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [, setLocation] = useLocation();

  const handleCategoryClick = (slug: string) => {
    setLocation(`/category/${slug}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="group bg-white rounded-xl lg:rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-saudi-green/30 p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2"
          onClick={() => handleCategoryClick(category.slug)}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-br from-saudi-green/10 to-saudi-green/20 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:from-saudi-green/20 group-hover:to-saudi-green/30 transition-all duration-300">
            <span className="text-xl sm:text-2xl lg:text-3xl">{category.emoji}</span>
          </div>
          <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-saudi-green transition-colors">
            {category.nameAr}
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600">
            استكشف العروض
          </p>
          <div className="mt-2 sm:mt-3 lg:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-6 sm:w-8 h-0.5 bg-saudi-green mx-auto rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
