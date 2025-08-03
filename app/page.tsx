// app/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData
} from 'firebase/firestore'
import BookCard, { BookData } from './components/BookCard'

export default function Home() {
  const [books, setBooks] = useState<BookData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On interroge la collection « books » triée par date de création décroissante
    const q = query(
      collection(db, 'books'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData

        // Gère photos dynamiques : soit un tableau, soit l'ancien objet {front,spine,back,inside}
        let photosArr: string[]
        if (Array.isArray(data.photos)) {
          photosArr = data.photos as string[]
        } else {
          const obj = data.photos as Record<string, string>
          photosArr = ['front', 'spine', 'back', 'inside']
            .map(key => obj[key])
            .filter((url): url is string => typeof url === 'string')
        }

        return {
          id:          doc.id,
          title:       data.title,
          author:      data.author,
          price:       data.price ?? null,
          description: data.description || undefined,
          photos:      photosArr
        } as BookData
      })

      setBooks(docs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Mon portfolio de reliure
      </h1>

      <div className="text-center mb-6">
        <a
          href="/add-book"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Ajouter un livre
        </a>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement…</p>
      ) : books.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun livre pour l’instant. Cliquez sur “Ajouter un livre”.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
