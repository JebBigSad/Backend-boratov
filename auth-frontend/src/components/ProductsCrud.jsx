import { useState, useEffect } from 'react';
import * as productsAPI from '../api/products';
import './CrudStyles.css';

function ProductsCrud({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    price: '' 
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.listProducts(token);
      setItems(data.data || data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title) {
      alert('Введите название товара');
      return;
    }
    try {
      await productsAPI.createProduct(formData, token);
      await loadItems();
      setFormData({ title: '', description: '', price: '' });
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await productsAPI.updateProduct(editingId, formData, token);
      await loadItems();
      setEditingId(null);
      setFormData({ title: '', description: '', price: '' });
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить товар?')) {
      try {
        await productsAPI.deleteProduct(id, token);
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
      description: item.description || '', 
      price: item.price || '' 
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Цена не указана';
    return `${price} ₽`;
  };

  return (
    <div className="crud-section">
      <h2>🛍️ Управление товарами</h2>
      
      <div className="crud-form">
        <input
          className="crud-input"
          placeholder="Название товара *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          className="crud-textarea"
          placeholder="Описание товара"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
        />
        <input
          className="crud-input"
          placeholder="Цена (в рублях)"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        {editingId ? (
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => {
              setEditingId(null);
              setFormData({ title: '', description: '', price: '' });
            }}>Отмена</button>
            <button className="btn-primary" onClick={handleUpdate}>Обновить товар</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleCreate}>➕ Добавить товар</button>
        )}
      </div>

      {loading && <div className="loading-spinner-small"></div>}
      
      <div className="crud-grid">
        {items.length === 0 && !loading ? (
          <div className="empty-state">Товаров пока нет</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="crud-card">
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              <div className="product-price">{formatPrice(item.price)}</div>
              <div className="item-date">
                {new Date(item.createAt || item.createdAt).toLocaleDateString()}
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

export default ProductsCrud;