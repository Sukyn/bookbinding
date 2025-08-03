// app/components/BookCard.tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react'

export interface BookData {
  id: string
  title: string
  author: string
  price?: number | null
  description?: string
  photos: string[]
}

export default function BookCard({ book }: { book: BookData }) {
  const images = book.photos.map((src, idx) => ({
    src,
    alt: `Image ${idx + 1}`
  }))

  const [current, setCurrent] = useState(0)
  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  return (
    <div className="shadow-lg rounded-2xl p-4 flex flex-col items-center bg-transparent">
      <h2 className="text-xl font-semibold">{book.title}</h2>

      {/* Auteur en blanc */}
      <p className="text-sm text-white mb-2">{book.author}</p>

      {/* Description en noir */}
      {book.description && (
        <p className="text-sm text-black italic mb-4">
          {book.description}
        </p>
      )}

      {book.price != null && book.price > 0 && (
        <p className="text-sm text-green-600 mb-4">Prix : {book.price} €</p>
      )}

      {/* Carrousel */}
      <div className="relative w-full h-64 mb-4 flex items-center justify-center">
        {/* Flèche précédente en noir */}
        <button
          onClick={prev}
          className="absolute left-2 text-3xl font-bold text-black hover:text-gray-700"
          aria-label="Précédent"
        >
          ‹
        </button>

        <img
          src={images[current].src}
          alt={images[current].alt}
          className="max-h-56 object-contain"
        />

        {/* Flèche suivante en noir */}
        <button
          onClick={next}
          className="absolute right-2 text-3xl font-bold text-black hover:text-gray-700"
          aria-label="Suivant"
        >
          ›
        </button>
      </div>

      {/* Pagination */}
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
