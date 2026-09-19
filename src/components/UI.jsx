import React from 'react'
import { Star, ShieldCheck, BadgeCheck, Award, X } from 'lucide-react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const map = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }
  return (
    <button className={`${map[variant] || map.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, color = 'navy', className = '' }) {
  const map = {
    navy: 'bg-navy-50 text-navy-600',
    coop: 'bg-coop-50 text-coop-700',
    saffron: 'bg-saffron-50 text-saffron-700',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[color]} ${className}`}>
      {children}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, sub, color = 'navy' }) {
  const map = {
    navy: 'bg-navy-500',
    coop: 'bg-coop-500',
    saffron: 'bg-saffron-500',
  }
  return (
    <div className="card p-5 flex items-start gap-4">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl ${map[color]} flex items-center justify-center text-white shrink-0`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-navy-700 font-display leading-tight truncate">{value}</p>
        <p className="text-sm text-navy-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-coop-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export function RatingStars({ rating = 0, size = 14, showValue = true }) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'fill-saffron-400 text-saffron-400' : 'fill-gray-200 text-gray-200'}
          />
        ))}
      </span>
      {showValue && <span className="text-xs font-semibold text-navy-500">{rating.toFixed(1)}</span>}
    </span>
  )
}

export function VerificationBadge({ label, active = true }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-coop-50 text-coop-700' : 'bg-gray-100 text-gray-400'}`}>
      <BadgeCheck size={14} />
      {label}
    </span>
  )
}

export function VerifiedTag() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-coop-700 bg-coop-50 px-2 py-1 rounded-full">
      <ShieldCheck size={13} /> Verified
    </span>
  )
}

export function CertBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 bg-navy-50 px-2 py-1 rounded-full">
      <Award size={13} /> Certified
    </span>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-cardHover w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <h3 className="font-display font-bold text-lg text-navy-700">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-navy-100 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

export function StatusPill({ status }) {
  const map = {
    Confirmed: 'bg-navy-50 text-navy-600',
    'In Progress': 'bg-saffron-50 text-saffron-700',
    Completed: 'bg-coop-50 text-coop-700',
    Cancelled: 'bg-red-50 text-red-600',
    Accepted: 'bg-navy-50 text-navy-600',
    Pending: 'bg-gray-100 text-gray-500',
    Active: 'bg-coop-50 text-coop-700',
    Suspended: 'bg-red-50 text-red-600',
  }
  return <Badge className={map[status] || 'bg-gray-100 text-gray-500'}>{status}</Badge>
}
