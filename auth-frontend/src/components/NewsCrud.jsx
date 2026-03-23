import { useEffect, useState } from 'react'
import { listNews, createNews, updateNews, deleteNews } from '../api/news'

function NewsCrud({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await listNews(token)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка загрузки новостей')
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
    setForm({ title: '', content: '' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (editingId === null) {
        await createNews({ title: form.title, content: form.content || null }, token)
      } else {
        await updateNews(
          editingId,
          { title: form.title, content: form.content || null },
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
    setForm({ title: item.title || '', content: item.content || '' })
  }

  const onDelete = async (id) => {
    setError(null)
    const ok = window.confirm('Удалить новость?')
    if (!ok) return
    try {
      await deleteNews(id, token)
      await load()
      if (editingId === id) resetForm()
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка удаления')
    }
  }

  return (
    <div>
      <h2>Новости</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: '#e53e3e', marginBottom: 8 }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Заголовок</label>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Контент</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
            style={{ width: '100%', height: 120 }}
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
          <div>Пока нет новостей</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{ border: '1px solid #ddd', padding: 12, marginBottom: 10 }}
            >
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              {item.content && (
                <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{item.content}</div>
              )}
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

export default NewsCrud

