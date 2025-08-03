// app/edit-book/[id]/page.tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { db } from '../../../lib/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore'

export default function EditBook() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<FileList | null>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  // 1. Chargement des données existantes
  useEffect(() => {
    async function fetchBook() {
      try {
        const ref = doc(db, 'books', id)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          setError('Livre introuvable.')
          return
        }
        const data = snap.data() as DocumentData
        setTitle(data.title as string)
        setAuthor(data.author as string)
        setPrice((data.price as number) ?? '')
        setDescription((data.description as string) ?? '')
        setPhotos(
          Array.isArray(data.photos)
            ? (data.photos as string[])
            : []
        )
      } catch (fetchError) {
        console.error(fetchError)
        setError('Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [id])

  // 2. Soumission de la mise à jour
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let finalPhotos = photos

      if (newFiles && newFiles.length > 0) {
        const urls: string[] = []
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i]
          const form = new FormData()
          form.append('file', file)
          form.append('upload_preset', uploadPreset)

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: form }
          )
          const json = await res.json()
          if (!json.secure_url) {
            throw new Error(`Échec de l’upload de ${file.name}`)
          }
          urls.push(json.secure_url)
        }
        finalPhotos = urls
      }

      const ref = doc(db, 'books', id)
      await updateDoc(ref, {
        title,
        author,
        price: price === '' ? null : price,
        description: description || null,
        photos: finalPhotos,
        updatedAt: Timestamp.now()
      })

      router.push('/')
    } catch (submitError) {
      console.error(submitError)
      const msg =
        submitError instanceof Error
          ? submitError.message
          : 'Erreur lors de la mise à jour.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="p-6 text-center">Chargement…</p>
  if (error)   return <p className="p-6 text-center text-red-600">{error}</p>

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Modifier le livre</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Photos actuelles */}
        <div>
          <label className="block mb-1">Photos actuelles</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        </div>

        {/* Nouveaux fichiers */}
        <div>
          <label className="block mb-1">Remplacer les photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setNewFiles(e.target.files)}
          />
          <p className="text-sm text-gray-500">
            Laissez vide pour conserver les photos existantes.
          </p>
        </div>

        {/* Bouton de mise à jour */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Enregistrement…' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}

