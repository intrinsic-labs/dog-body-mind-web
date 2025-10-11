"use client";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-8 -mt-8 md:mb-8">
      <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-4 sm:px-6 lg:px-8 md:px-0 -mx-4 sm:-mx-6 lg:-mx-8 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* All Categories Chip */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`
            flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all
            ${
              selectedCategory === null
                ? "bg-orange text-white"
                : "bg-foreground/5 text-foreground hover:bg-foreground/10"
            }
          `}
        >
          All
        </button>

        {/* Category Chips */}
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`
              flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                selectedCategory === category._id
                  ? "bg-orange text-white"
                  : "bg-foreground/5 text-foreground hover:bg-foreground/10"
              }
            `}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>
  );
}
