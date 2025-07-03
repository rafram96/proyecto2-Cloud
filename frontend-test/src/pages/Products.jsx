import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { userService } from '../services/api'

function Products() {
  const [listResult, setListResult] = useState([])
  const [createForm, setCreateForm] = useState({ nombre: '', descripcion: '', precio: 0, categoria: '', stock: 0, imagen_url: '' })
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [updateForm, setUpdateForm] = useState({ codigo: '', nombre: '', descripcion: '', precio: 0, categoria: '', stock: 0, imagen_url: '' })
  const [deleteCode, setDeleteCode] = useState('')
  const [message, setMessage] = useState('')

  const currentUser = userService.getCurrentUser()

  const handleList = async () => {
    try {
      const res = await productService.list({ limit: 10 })
      setListResult(res.data.productos || [])
    } catch (err) {
      console.error(err)
      setMessage('Error al listar productos')
    }
  }

  // Listar productos al montar
  useEffect(() => { handleList() }, [])

  const handleCreate = async () => {
    try {
      const payload = { ...createForm }
      const res = await productService.create(payload)
      setMessage('Producto creado correctamente')
      setCreateForm({ nombre: '', descripcion: '', precio: 0, categoria: '', stock: 0, imagen_url: '' })
      handleList()
    } catch (err) {
      console.error(err)
      setMessage('Error al crear producto')
    }
  }

  // Buscar producto por código
  const handleSearch = async () => {
    try {
      const res = await productService.get({ codigo: searchCode })
      setSearchResult(res.data.producto)
    } catch (err) {
      console.error(err)
      setMessage('Error al buscar producto')
    }
  }

  // Actualizar producto
  const handleUpdate = async () => {
    try {
      const res = await productService.update(updateForm)
      setMessage('Producto actualizado correctamente')
      handleList()
    } catch (err) {
      console.error(err)
      setMessage('Error al actualizar producto')
    }
  }

  // Eliminar producto
  const handleDelete = async () => {
    try {
      const res = await productService.remove({ codigo: deleteCode })
      setMessage('Producto eliminado correctamente')
      handleList()
    } catch (err) {
      console.error(err)
      setMessage('Error al eliminar producto')
    }
  }

  return (
    <div className="page-container">
      <div className="products-header">
        <h2>🛍️ Gestión de Productos</h2>
        <span className="tenant-badge">Tenant: {currentUser?.tenant_id}</span>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Lista de productos */}
      <div className="products-section">
        <h3>📋 Productos Registrados ({listResult.length})</h3>
        {listResult.length === 0 ? (
          <div className="empty-state">
            <p>No hay productos registrados. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="products-grid">
            {listResult.map(p => (
              <div key={p.codigo} className="product-card">
                <div className="product-header">
                  <h4>{p.nombre}</h4>
                  <span className="product-code">{p.codigo}</span>
                </div>
                <p className="product-description">{p.descripcion}</p>
                <div className="product-details">
                  <span className="price">${p.precio}</span>
                  <span className="stock">Stock: {p.stock}</span>
                  <span className="category">{p.categoria}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crear producto */}
      <div className="form-section">
        <h3>➕ Crear Nuevo Producto</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              placeholder="Ej: iPhone 15 Pro"
              value={createForm.nombre}
              onChange={e => setCreateForm({ ...createForm, nombre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              placeholder="Descripción del producto..."
              value={createForm.descripcion}
              onChange={e => setCreateForm({ ...createForm, descripcion: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={createForm.precio}
              onChange={e => setCreateForm({ ...createForm, precio: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Categoría:</label>
            <select
              value={createForm.categoria}
              onChange={e => setCreateForm({ ...createForm, categoria: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              <option value="electronicos">Electrónicos</option>
              <option value="hogar">Hogar</option>
              <option value="ropa">Ropa</option>
              <option value="deportes">Deportes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={createForm.stock}
              onChange={e => setCreateForm({ ...createForm, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>URL Imagen:</label>
            <input
              type="url"
              placeholder="https://..."
              value={createForm.imagen_url}
              onChange={e => setCreateForm({ ...createForm, imagen_url: e.target.value })}
            />
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          Crear Producto
        </button>
      </div>

      {/* Buscar producto */}
      <div className="form-section">
        <h3>🔍 Buscar Producto</h3>
        <div className="search-form">
          <input
            type="text"
            placeholder="Ingresa el código del producto"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
          />
          <button className="btn-secondary" onClick={handleSearch}>
            Buscar
          </button>
        </div>
        {searchResult && (
          <div className="search-result">
            <h4>Resultado:</h4>
            <div className="product-card">
              <div className="product-header">
                <h4>{searchResult.nombre}</h4>
                <span className="product-code">{searchResult.codigo}</span>
              </div>
              <p>{searchResult.descripcion}</p>
              <div className="product-details">
                <span className="price">${searchResult.precio}</span>
                <span className="stock">Stock: {searchResult.stock}</span>
                <span className="category">{searchResult.categoria}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actualizar producto */}
      <div className="form-section">
        <h3>✏️ Actualizar Producto</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              placeholder="Código del producto a actualizar"
              value={updateForm.codigo}
              onChange={e => setUpdateForm({ ...updateForm, codigo: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={updateForm.nombre}
              onChange={e => setUpdateForm({ ...updateForm, nombre: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Precio:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={updateForm.precio}
              onChange={e => setUpdateForm({ ...updateForm, precio: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              min="0"
              value={updateForm.stock}
              onChange={e => setUpdateForm({ ...updateForm, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <button className="btn-warning" onClick={handleUpdate}>
          Actualizar Producto
        </button>
      </div>

      {/* Eliminar producto */}
      <div className="form-section">
        <h3>🗑️ Eliminar Producto</h3>
        <div className="delete-form">
          <input
            type="text"
            placeholder="Código del producto a eliminar"
            value={deleteCode}
            onChange={e => setDeleteCode(e.target.value)}
          />
          <button className="btn-danger" onClick={handleDelete}>
            Eliminar Producto
          </button>
        </div>
      </div>
    </div>
  )
}

export default Products
