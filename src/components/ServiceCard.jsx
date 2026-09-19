import React from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'

export default function ServiceCard({ category }) {
  const navigate = useNavigate()
  const Icon = Icons[category.icon] || Icons.Wrench

  return (
    <button
      onClick={() => navigate(`/services?category=${category.id}`)}
      className="card p-5 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl bg-navy-50 group-hover:bg-navy-500 flex items-center justify-center text-navy-500 group-hover:text-white transition-colors">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-sm text-navy-700">{category.name}</p>
    </button>
  )
}
