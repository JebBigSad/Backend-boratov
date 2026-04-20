import { useState, useEffect } from 'react';
import * as postsAPI from '../api/posts';
import './CrudStyles.css';

function PostsCrud({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.listPosts(token);
      setItems(data.data || data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await postsAPI.createPost(formData, token);
      await loadItems();
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await postsAPI.updatePost(editingId, formData, token);
      await loadItems();
      setEditingId(null);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить пост?')) {
      try {
        await postsAPI.deletePost(id, token);
        await loadItems();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, content: item.content });
  };

  return (
    <div className="crud-section">
      <h2>📝 Управление постами</h2>
      
      <div className="crud-form">
        <input
          className="crud-input"
          placeholder="Заголовок"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          className="crud-textarea"
          placeholder="Содержание"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows="4"
        />
        {editingId ? (
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({ title: '', content: '' });
            }}>Отмена</button>
            <button className="btn-primary" onClick={handleUpdate}>Обновить</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleCreate}>Создать пост</button>
        )}
      </div>

      {loading && <div className="loading-spinner-small"></div>}
      
      <div className="crud-grid">
        {items.map(item => (
          <div key={item.id} className="crud-card">
            <h3>{item.title}</h3>
            <p>{item.content}</p>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => startEdit(item)}>✏️</button>
              <button className="btn-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostsCrud;