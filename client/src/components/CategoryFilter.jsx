const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Organic'];

const CategoryFilter = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category === 'All' ? '' : category)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
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
