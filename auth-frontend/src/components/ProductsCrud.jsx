import { useEffect, useState } from 'react'
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products'

function ProductsCrud({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: '' })

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await listProducts(token)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const resetForm = () => {
    setEditingId(null)
    setForm({ title: '', description: '', price: '' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const priceValue =
      form.price === '' || form.price === null ? null : Number(form.price)

    try {
      if (editingId === null) {
        await createProduct(
          {
            title: form.title,
            description: form.description || null,
            price: Number.isFinite(priceValue) ? priceValue : null,
          },
          token
        )
      } else {
        await updateProduct(
          editingId,
          {
            title: form.title,
            description: form.description || null,
            price: Number.isFinite(priceValue) ? priceValue : null,
          },
          token
        )
      }
      await load()
      resetForm()
    } catch (e2) {
      setError(e2?.data?.error || e2?.message || 'Ошибка сохранения')
    }
  }

  const onEdit = (item) => {
    setError(null)
    setEditingId(item.id)
    setForm({
      title: item.title || '',
      description: item.description || '',
      price: item.price === null || item.price === undefined ? '' : String(item.price),
    })
  }

  const onDelete = async (id) => {
    setError(null)
    const ok = window.confirm('Удалить товар?')
    if (!ok) return
    try {
      await deleteProduct(id, token)
      await load()
      if (editingId === id) resetForm()
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка удаления')
    }
  }

  return (
    <div>
      <h2>Товары</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: '#e53e3e', marginBottom: 8 }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Название</label>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            style={{ width: '100%', height: 90 }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Цена (int)</label>
          <input
            value={form.price}
            onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            placeholder="например, 1999"
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit">{editingId === null ? 'Создать' : 'Обновить'}</button>
        {editingId !== null && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
            Отмена
          </button>
        )}
      </form>

      <div>
        {items.length === 0 ? (
          <div>Пока нет товаров</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{ border: '1px solid #ddd', padding: 12, marginBottom: 10 }}
            >
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              {item.description && (
                <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{item.description}</div>
              )}
              <div style={{ color: '#666', marginTop: 6 }}>
                Цена: {item.price === null ? '-' : item.price}
              </div>
              <div style={{ color: '#666', marginTop: 6 }}>
                Автор: {item.author?.username} (id: {item.author?.id})
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => onEdit(item)}>
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  style={{ marginLeft: 8 }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductsCrud

