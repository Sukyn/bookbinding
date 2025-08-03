// app/components/BookCard.tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export interface BookData {
  id: string
  title: string
  author: string
  price?: number | null
  description?: string
  photos: string[]
}

export default function BookCard({ book }: { book: BookData }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const images = book.photos.map((src, idx) => ({ src, alt: `Image ${idx + 1}` }))

  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  const handleDelete = async () => {
    if (!confirm(`Supprimer « ${book.title} » ?`)) return
    try {
      await deleteDoc(doc(db, 'books', book.id))
      // Firestore onSnapshot rafraîchit automatiquement la liste
      alert('Livre supprimé.')
    } catch (e) {
      console.error(e)
      alert('Erreur lors de la suppression.')
    }
  }

  const handleEdit = () => {
    router.push(`/edit-book/${book.id}`)
  }

  return (
    <div className="shadow-lg rounded-2xl p-4 flex flex-col items-center">
      <h2 className="text-xl font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
      {book.description && (
        <p className="text-sm text-gray-800 italic mb-2">{book.description}</p>
      )}
      {book.price != null && book.price > 0 && (
        <p className="text-sm text-green-600 mb-4">Prix : {book.price} €</p>
      )}

      {/* Carrousel */}
      <div className="relative w-full h-64 mb-4 flex items-center justify-center">
        <button
          onClick={prev}
          className="absolute left-2 text-3xl font-bold text-gray-700 hover:text-black"
          aria-label="Précédent"
        >‹</button>
        <img
          src={images[current].src}
          alt={images[current].alt}
          className="max-h-56 object-contain"
        />
        <button
          onClick={next}
          className="absolute right-2 text-3xl font-bold text-gray-700 hover:text-black"
          aria-label="Suivant"
        >›</button>
      </div>

      {/* Pagination */}
      <div className="flex space-x-2 mb-4">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={
              idx === current
                ? 'w-2 h-2 rounded-full bg-gray-800'
                : 'w-2 h-2 rounded-full bg-gray-400'
            }
          />
        ))}
      </div>

      {/* Boutons Modifier / Supprimer */}
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Modifier
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
