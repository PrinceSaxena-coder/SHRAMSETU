import React from 'react'

export default function Sidebar({ items }) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="card p-3 lg:sticky lg:top-20">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors text-left ${
                item.active ? 'bg-navy-500 text-white' : 'text-navy-500 hover:bg-navy-50'
              }`}
            >
              {item.icon && <item.icon size={17} />}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
