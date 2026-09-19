@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  color: #121b35;
  background-color: #f7f8fb;
  overflow-x: hidden;
}

h1, h2, h3, h4, .font-display {
  font-family: 'Poppins', sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #a9b7d3;
  border-radius: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

@layer components {
  .container-app {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .card {
    @apply bg-white rounded-2xl shadow-card border border-navy-100/60 transition-shadow duration-200;
  }

  .card:hover {
    @apply shadow-cardHover;
  }

  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-xl bg-navy-500 px-5 py-2.5 text-white font-semibold text-sm hover:bg-navy-600 active:bg-navy-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-xl bg-coop-500 px-5 py-2.5 text-white font-semibold text-sm hover:bg-coop-600 active:bg-coop-700 transition-colors duration-150;
  }

  .btn-accent {
    @apply inline-flex items-center justify-center gap-2 rounded-xl bg-saffron-500 px-5 py-2.5 text-white font-semibold text-sm hover:bg-saffron-600 active:bg-saffron-700 transition-colors duration-150;
  }

  .btn-outline {
    @apply inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy-500 px-5 py-2.5 text-navy-500 font-semibold text-sm hover:bg-navy-500 hover:text-white transition-colors duration-150;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-navy-500 font-medium text-sm hover:bg-navy-50 transition-colors duration-150;
  }

  .input-field {
    @apply w-full rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm text-navy-700 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-coop-400 focus:border-coop-400 transition-shadow;
  }

  .section-label {
    @apply inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-coop-600 bg-coop-50 px-3 py-1 rounded-full;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.animate-pulse-soft {
  animation: pulseSoft 2s ease-in-out infinite;
}

@keyframes radarPing {
  0% { transform: scale(0.6); opacity: 0.55; }
  100% { transform: scale(1.9); opacity: 0; }
}
.animate-radar {
  animation: radarPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}
