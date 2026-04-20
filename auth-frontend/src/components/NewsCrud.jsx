import { useState, useEffect } from 'react';
import * as newsAPI from '../api/news';
import './CrudStyles.css';

function NewsCrud({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '' 
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await newsAPI.listNews(token);
      setItems(data.data || data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title) {
      alert('Введите заголовок новости');
      return;
    }
    try {
      await newsAPI.createNews(formData, token);
      await loadItems();
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await newsAPI.updateNews(editingId, formData, token);
      await loadItems();
      setEditingId(null);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить новость?')) {
      try {
        await newsAPI.deleteNews(id, token);
        await loadItems();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({ 
      title: item.title, 
      content: item.content || '' 
    });
  };

  return (
    <div className="crud-section">
      <h2>📰 Управление новостями</h2>
      
      <div className="crud-form">
        <input
          className="crud-input"
          placeholder="Заголовок новости *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          className="crud-textarea"
          placeholder="Содержание новости"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows="5"
        />
        {editingId ? (
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({ title: '', content: '' });
            }}>Отмена</button>
            <button className="btn-primary" onClick={handleUpdate}>Обновить новость</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleCreate}>➕ Добавить новость</button>
        )}
      </div>

      {loading && <div className="loading-spinner-small"></div>}
      
      <div className="crud-grid">
        {items.length === 0 && !loading ? (
          <div className="empty-state">Новостей пока нет</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="crud-card">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <div className="item-date">
                {new Date(item.createAt || item.createdAt).toLocaleDateString()}
              </div>
              <div className="item-tags">
                <span className="tag">📰 Новость</span>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => startEdit(item)}>
                  ✏️ Редактировать
                </button>
                <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NewsCrud;