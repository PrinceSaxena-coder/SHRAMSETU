import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Zap } from 'lucide-react'
import { RatingStars, VerifiedTag, Badge, Button } from './UI'

export default function WorkerCard({ worker }) {
  const navigate = useNavigate()
  const initials = worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)

  return (
    <div className="card p-5 flex flex-col animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0"
            style={{ backgroundColor: worker.avatarColor }}
          >
            {initials}
          </div>
          <div>
            <p className="font-display font-bold text-navy-700">{worker.name}</p>
            <p className="text-sm text-coop-600 font-semibold">{worker.skill}</p>
          </div>
        </div>
        {worker.verified && <VerifiedTag />}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-navy-400">
        <RatingStars rating={worker.rating} />
        <span className="flex items-center gap-1"><Briefcase size={13} /> {worker.experience} yrs</span>
        <span className="flex items-center gap-1"><MapPin size={13} /> {worker.distance} km</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge color="navy">{worker.jobsCompleted} jobs completed</Badge>
        <Badge color={worker.availability.includes('Today') ? 'coop' : 'gray'}>
          <Zap size={11} /> {worker.availability}
        </Badge>
      </div>

      <p className="text-xs text-navy-400 mt-2 truncate">{worker.location} &middot; {worker.cooperative}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-100">
        <div>
          <p className="text-xs text-navy-300">Starting at</p>
          <p className="font-display font-bold text-navy-700">₹{worker.price}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/service/${worker.id}`)}>View</Button>
          <Button variant="primary" onClick={() => navigate(`/booking?workerId=${worker.id}`)}>Book Now</Button>
        </div>
      </div>
    </div>
  )
}
