'use client';

import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Post Offer">
      <Plus size={24} />
    </button>
  );
}
