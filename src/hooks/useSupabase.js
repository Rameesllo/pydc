import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { books as fallbackBooks } from '../data/books'

export function useSupabase() {
  const [books, setBooks] = useState(fallbackBooks)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('books').select('*')
      if (error) throw error
      if (data && data.length > 0) {
        setBooks(data)
      } else {
        setBooks(fallbackBooks)
      }
    } catch (err) {
      console.warn("Failed to fetch books from Supabase, falling back to local data:", err.message)
      setError(err.message)
      setBooks(fallbackBooks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return { books, loading, error, refetch: fetchBooks }
}
