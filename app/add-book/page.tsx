// app/add-book/page.tsx
'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '../../lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export default function AddBook() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Validation : au moins 1 image
    if (!files || files.length < 1) {
      setError('Merci de sélectionner au moins une photo.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1) Upload dynamique sur Cloudinary
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const data = new FormData()
        data.append('file', file)
        data.append('upload_preset', uploadPreset)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: data }
        )
        const json = await res.json()
        if (!json.secure_url) {
          throw new Error(`Échec de l’upload de ${file.name}`)
        }
        urls.push(json.secure_url)
      }

      // 2) Enregistrement dans Firestore
      await addDoc(collection(db, 'books'), {
        title,
        author,
        price: price === '' ? null : price,
        description: description || null,
        photos: urls,              // on stocke le tableau d’URLs
        createdAt: Timestamp.now()
      })

      // 3) Redirection
      router.push('/')
    } catch (err: unknown) {
        console.error(err)
        // Si c'est une Error, on affiche son message, sinon un message générique
        const message =
          err instanceof Error ? err.message : 'Une erreur est survenue, réessayez.'
        setError(message)
      } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ajouter un livre</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <label className="block mb-1">Titre</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Auteur */}
        <div>
          <label className="block mb-1">Auteur</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            required
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block mb-1">Prix (facultatif)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={price}
            onChange={e =>
              setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
            }
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block mb-1">Photos (au moins une)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setFiles(e.target.files)}
            required
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Envoi...' : 'Ajouter le livre'}
        </button>
      </form>
    </div>
  )
}
