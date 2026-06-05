interface CategoryBadgeProps {
  category: string
  variant?: 'default' | 'primary'
}

export default function CategoryBadge({
  category,
  variant = 'default'
}: CategoryBadgeProps) {
  const variantStyles = {
    default: 'bg-slate-50 text-slate-600 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-100',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${variantStyles[variant]}`}>
      {category}
    </span>
  )
}
