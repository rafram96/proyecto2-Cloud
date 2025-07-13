import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import SearchBar from '../components/SearchBar';
import { ProductEditModal } from '../components/ProductEditModal';
import Pagination from '../components/Pagination';

const MyProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Estados para búsqueda y autocompletado
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Estados para modal de edición desde búsqueda
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // Cambié a 9 para un grid 3x3

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    stock: 0,
    tags: [] as string[],
    tagsInput: '', // Campo separado para el input de texto
  });

  const categorias = [
    'Gaming Gear',
    'Smartphones', 
    'Laptops & PCs',
    'Audio & Headphones',
    'Accessories',
    'TV & Monitors'
  ];

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar productos
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.nombre.toLowerCase().includes(searchLower) ||
      product.codigo.toLowerCase().includes(searchLower) ||
      product.categoria.toLowerCase().includes(searchLower)
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, [user?.tenantId]);

  // Función para generar código automáticamente
  const generateProductCode = () => {
    if (!user?.tenantId) return '';
    
    // Obtener las primeras 3 letras del tenant en mayúsculas
    const tenantPrefix = user.tenantId.substring(0, 3).toUpperCase();
    
    // Obtener el número siguiente basado en productos existentes
    const existingCodes = products
      .map(p => p.codigo)
      .filter(code => code.startsWith(tenantPrefix))
      .map(code => {
        const numPart = code.replace(tenantPrefix, '').replace(/^0+/, '');
        return parseInt(numPart) || 0;
      });
    
    const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    
    // Formatear con ceros a la izquierda (4 dígitos)
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `${tenantPrefix}${formattedNumber}`;
  };

  const handleGenerateCode = () => {
    const newCode = generateProductCode();
    
    // Verificar si el código ya existe
    const codeExists = products.some(p => p.codigo === newCode);
    
    if (codeExists) {
      alert(`El código ${newCode} ya existe. Por favor, genera otro código o ingresa uno manualmente.`);
      return;
    }
    
    setFormData(prev => ({ ...prev, codigo: newCode }));
    
    // Feedback visual opcional (puedes descomentar si quieres mostrar un mensaje)
    // alert(`Código generado: ${newCode}`);
  };

  const loadProducts = async () => {
    if (!user?.tenantId) return;
    
    try {
      console.log('🔍 Iniciando carga de productos...');
      setLoading(true);
      
      const result = await productService.listarProductos();
      console.log('📦 Respuesta recibida:', result);
      
      if (result.success && result.data?.productos) {
        console.log(`✅ ${result.data.productos.length} productos cargados`);
        setProducts(result.data.productos);
      } else {
        console.log('❌ No se encontraron productos o error en respuesta:', result);
        setProducts([]);
      }
    } catch (error) {
      console.error('💥 Error cargando productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      console.log('🏁 Carga de productos finalizada');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, GIF)');
        return;
      }
      
      // Validar tamaño (10MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, tagsInput: value }));
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      stock: 0,
      tags: [],
      tagsInput: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
    setShowCreateForm(false);
    setIsDragOver(false);
    
    // Limpiar el input file
    const fileInput = (window as any).fileInput;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;

    try {
      setUploading(true);
      
      let imageUrl = editingProduct?.imagen_url || '';
      
      // Subir imagen si hay una nueva
      if (imageFile) {
        console.log('🖼️ Subiendo imagen...');
        const uploadResult = await productService.uploadImage(imageFile, user.tenantId);
        console.log('📤 Resultado del upload:', uploadResult);
        if (uploadResult.success && uploadResult.data?.imagen_url) {
          imageUrl = uploadResult.data.imagen_url;
          console.log('✅ URL de imagen asignada:', imageUrl);
        } else {
          console.error('❌ Error en upload:', uploadResult.error);
        }
      }

      const productData = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        categoria: formData.categoria,
        stock: formData.stock,
        tags: formData.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag),
        imagen_url: imageUrl,
      };

      let result;
      if (editingProduct) {
        // Actualizar producto existente
        result = await productService.actualizarProducto(editingProduct.codigo, productData);
      } else {
        // Crear nuevo producto
        result = await productService.crearProducto(productData);
      }

      if (result.success) {
        // 1. Mostrar mensaje de éxito
        alert(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        
        // 2. Limpiar formulario
        resetForm();
        
        // 3. FORZAR recarga inmediata de productos
        console.log('🔄 Recargando lista de productos después de crear/actualizar...');
        setLoading(true);
        await loadProducts();
        setLoading(false);
        console.log('✅ Lista de productos actualizada');
      } else {
        alert('Error: ' + (result.error || 'No se pudo procesar el producto'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el producto');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categoria: product.categoria,
      stock: product.stock,
      tags: product.tags || [],
      tagsInput: (product.tags || []).join(', '),
    });
    setImagePreview(product.imagen_url || '');
    setShowCreateForm(true);
  };

  const handleDelete = async (codigo: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const result = await productService.eliminarProducto(codigo);
      if (result.success) {
        await loadProducts();
        alert('Producto eliminado exitosamente');
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Funciones para búsqueda con modal de edición
  const handleSuggestionSelect = async (suggestion: string) => {
    try {
      console.log(`🎯 Sugerencia seleccionada para edición: "${suggestion}"`);
      // Buscar el producto específico que coincida con la sugerencia
      const result = await productService.searchProducts({ query: suggestion, limit: 1 });
      console.log(`📋 Resultado búsqueda para edición:`, result);
      
      if (result.success && result.data?.productos && result.data.productos.length > 0) {
        const product = result.data.productos[0];
        console.log(`✅ Producto encontrado para editar:`, product);
        setSelectedProductForEdit(product);
        setIsEditModalOpen(true);
      } else {
        console.log(`❌ No se encontró producto para editar: "${suggestion}"`);
        alert('No se encontró el producto para editar');
      }
    } catch (error) {
      console.error('❌ Error al buscar producto para editar:', error);
      alert('Error al buscar el producto');
    }
  };

  const handleQuickSearch = async (query: string) => {
    try {
      console.log(`🔍 Búsqueda rápida para edición: "${query}"`);
      const result = await productService.searchProducts({ query, limit: 1 });
      console.log(`📋 Resultado búsqueda rápida:`, result);
      
      if (result.success && result.data?.productos && result.data.productos.length > 0) {
        const product = result.data.productos[0];
        console.log(`✅ Producto encontrado en búsqueda rápida:`, product);
        setSelectedProductForEdit(product);
        setIsEditModalOpen(true);
      } else {
        console.log(`❌ No se encontró producto en búsqueda rápida: "${query}"`);
        // Continúa con la búsqueda normal en la lista
        await handleNormalSearch(query);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda rápida:', error);
      await handleNormalSearch(query);
    }
  };

  const handleNormalSearch = async (query: string) => {
    try {
      if (!query.trim()) {
        await loadProducts();
        return;
      }
      
      const result = await productService.searchProducts({ query, page: 1, limit: 12 });
      if (result.success && result.data?.productos) {
        setProducts(result.data.productos);
      } else {
        console.warn('No se encontraron productos');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error en búsqueda normal:', error);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedProductForEdit(null);
  };

  const handleEditModalSave = async (_updatedProduct: Product) => {
    // Actualizar la lista de productos
    await loadProducts();
    console.log('✅ Producto actualizado desde modal, lista recargada');
  };

  const handleEditModalDelete = async (_productCode: string) => {
    // Actualizar la lista de productos
    await loadProducts();
    console.log('✅ Producto eliminado desde modal, lista recargada');
  };

  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page when search changes
  }, [searchTerm]);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-koulen font-bold text-gray-900 dark:text-gray-100">
                MIS PRODUCTOS
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-jaldi">
                Gestiona tu catálogo de productos
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-jaldi font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showCreateForm ? 'Cancelar' : 'Nuevo Producto'}
            </button>
          </div>
          <div className="w-full h-px bg-yellow-400 dark:bg-yellow-500 mt-4"></div>
        </div>

        {/* Formulario de creación/edición */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl p-6 mb-8 theme-transition">
            <h2 className="text-2xl font-koulen font-bold text-gray-900 dark:text-gray-100 mb-6">
              {editingProduct ? 'EDITAR PRODUCTO' : 'CREAR NUEVO PRODUCTO'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código del producto */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Código del Producto
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingProduct}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      placeholder="SKU001"
                    />
                    {!editingProduct && (
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-jaldi font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                        title="Generar código automáticamente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generar
                      </button>
                    )}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition"
                    placeholder="Nombre del producto"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Precio (S/.)
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition"
                    placeholder="0.00"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition"
                    placeholder="0"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags (separados por comas)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={handleTagsChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition"
                    placeholder="gaming, alta calidad, nuevo"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent theme-transition resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-jaldi font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Imagen del Producto
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1">
                    {/* Input oculto para archivos */}
                    <input
                      ref={(input) => {
                        if (input) {
                          (window as any).fileInput = input;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    {/* Área de drop y botón */}
                    <div 
                      className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDragOver 
                          ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 transform scale-[1.02]' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500 bg-gray-50 dark:bg-gray-700/50'
                      }`}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const file = files[0];
                          if (file.type.startsWith('image/')) {
                            // Validar tamaño (10MB máximo)
                            const maxSize = 10 * 1024 * 1024; // 10MB en bytes
                            if (file.size > maxSize) {
                              alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB');
                              return;
                            }
                            
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onload = () => setImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            alert('Por favor arrastra un archivo de imagen válido (PNG, JPG, GIF)');
                          }
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        // Solo quitar el estado si realmente salimos del área
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setIsDragOver(false);
                        }
                      }}
                      onClick={() => {
                        const fileInput = (window as any).fileInput;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          <p className="font-semibold">Haz clic para subir una imagen</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            o arrastra y suelta aquí
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            PNG, JPG, GIF hasta 10MB
                          </p>
                        </div>
                        {imageFile && (
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ {imageFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview de la imagen */}
                  {imagePreview && (
                    <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-jaldi font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-jaldi font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de búsqueda de productos con edición rápida */}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🚀 Edición Rápida
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Escribe el nombre de un producto y selecciona de las sugerencias para editarlo directamente
            </p>
          </div>
          <SearchBar
            placeholder="Buscar producto para editar... (ej: headphones, laptop)"
            onSearch={handleQuickSearch}
            onAutocomplete={async (q) => {
              try {
                if (!q.trim()) {
                  setSuggestions([]);
                  return;
                }
                
                const result = await productService.autocompleteProducts(q, 5);
                if (result.success && result.data?.suggestions) {
                  setSuggestions(result.data.suggestions);
                } else {
                  setSuggestions([]);
                }
              } catch (error) {
                console.error('Error en autocomplete:', error);
                setSuggestions([]);
              }
            }}
            onSuggestionSelect={handleSuggestionSelect}
            suggestions={suggestions}
          />
        </div>

        {/* Lista de productos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl theme-transition">
          <div className="p-6">
            <h2 className="text-2xl font-koulen font-bold text-gray-900 dark:text-gray-100 mb-6">
              PRODUCTOS REGISTRADOS ({products?.length || 0})
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4.01L4 7m16 0v10l-8 4-8-4V7" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-jaldi">
                  No tienes productos registrados
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Crea tu primer producto para comenzar a vender
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Imagen</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Código</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Categoría</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Precio</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                      <th className="text-left py-3 px-4 font-jaldi font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr key={product.codigo} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-4 px-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                            <img
                              src={product.imagen_url || '/placeholder.png'}
                              alt={product.nombre || 'Producto'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-jaldi">{product.codigo}</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-jaldi">{product.nombre}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-jaldi">{product.categoria}</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-jaldi">S/. {product.precio.toFixed(2)}</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-jaldi">{product.stock}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product.codigo)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal de edición rápida */}
        {isEditModalOpen && selectedProductForEdit && (
          <ProductEditModal
            isOpen={isEditModalOpen}
            onClose={handleEditModalClose}
            product={selectedProductForEdit}
            onSave={handleEditModalSave}
            onDelete={handleEditModalDelete}
          />
        )}
      </div>
    </div>
  );
};

export default MyProducts;
