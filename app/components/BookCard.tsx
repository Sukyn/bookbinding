'use client'

import React, { useState } from 'react'

export interface BookData {
  id: string
  title: string
  author: string
  price?: number | null
  description?: string
  photos: string[]           // ← tableau dynamique
}

export default function BookCard({ book }: { book: BookData }) {
  // On crée le tableau d’images avec un alt générique
  const images = book.photos.map((src, idx) => ({
    src,
    alt: `Image ${idx + 1}`
  }))

  const [current, setCurrent] = useState(0)
  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  return (
    <div className="shadow-lg rounded-2xl p-4 flex flex-col items-center">
      <h2 className="text-xl font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
      {book.description && (
        <p className="text-sm text-gray-800 italic mb-4">{book.description}</p>
      )}
      {book.price != null && book.price > 0 && (
        <p className="text-sm text-green-600 mb-4">Prix : {book.price} €</p>
      )}

      {/* Carrousel dynamique */}
      <div className="relative w-full h-64 mb-4 flex items-center justify-center">
        <button
          onClick={prev}
          className="absolute left-2 text-3xl font-bold text-gray-700 hover:text-black"
          aria-label="Précédent"
        >
          ‹
        </button>

        <img
          src={images[current].src}
          alt={images[current].alt}
          className="max-h-56 object-contain"
        />

        <button
          onClick={next}
          className="absolute right-2 text-3xl font-bold text-gray-700 hover:text-black"
          aria-label="Suivant"
        >
          ›
        </button>
      </div>

      {/* Pagination (points) */}
      <div className="flex space-x-2">
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
    </div>
  )
}
