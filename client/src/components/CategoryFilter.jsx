const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'];

const CategoryFilter = ({ value, onChange }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category === 'All' ? '' : category)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            (value || 'All') === category || (!value && category === 'All')
              ? 'bg-leaf text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-green-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
