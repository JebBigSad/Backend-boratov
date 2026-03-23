import { useEffect, useState } from 'react'
import { listPosts, createPost, updatePost, deletePost } from '../api/posts'

function PostsCrud({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await listPosts(token)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка загрузки постов')
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
        await createPost(
          { title: form.title, content: form.content || null },
          token
        )
      } else {
        await updatePost(
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
    setForm({
      title: item.title || '',
      content: item.content || '',
    })
  }

  const onDelete = async (id) => {
    setError(null)
    const ok = window.confirm('Удалить пост?')
    if (!ok) return
    try {
      await deletePost(id, token)
      await load()
      if (editingId === id) resetForm()
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Ошибка удаления')
    }
  }

  return (
    <div>
      <h2>Посты</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: '#e53e3e', marginBottom: 8 }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <div>
          <label>Заголовок</label>
          <input
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        <div>
          <label>Контент</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
            style={{ width: '100%', height: 120, marginBottom: 8 }}
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
          <div>Пока нет постов</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ddd',
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{item.content}</div>
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

export default PostsCrud

