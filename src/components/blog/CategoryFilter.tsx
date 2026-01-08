"use client";

import Select from "@/components/ui/Select";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  id?: string;
  label?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  id = "blog-category",
  label = "Category",
}: CategoryFilterProps) {
  const options = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({
      value: c._id,
      label: c.title,
    })),
  ];

  return (
    <Select
      id={id}
      label={label}
      value={selectedCategory ?? ""}
      onChange={(value) => onCategoryChange(value || null)}
      options={options}
      placeholder="All categories"
      srOnlyLabel
      className="w-full"
    />
  );
}
