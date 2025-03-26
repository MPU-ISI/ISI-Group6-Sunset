import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingStock, setEditingStock] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDisabled, setShowDisabled] = useState(true)
  const [imageChanges, setImageChanges] = useState({})

  // 使用防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list?${debouncedSearchTerm ? `search=${debouncedSearchTerm}&` : ''}showDisabled=${showDisabled}`)
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList();
  }, [debouncedSearchTerm, showDisabled])

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const updateStock = async (productId, size, newQuantity) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update-stock',
        { productId, size, quantity: newQuantity },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Stock updated successfully')
        await fetchList()
        setEditingStock(null)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  
  const toggleProductStatus = async (productId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/toggle-status',
        { productId },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageChanges(prev => ({
          ...prev,
          [index]: {
            file,
            preview: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  const removeImage = (index) => {
    setImageChanges(prev => ({
      ...prev,
      [index]: {
        file: null,
        preview: null,
        toDelete: true
      }
    }));
  }

  const saveProductEdit = async () => {
    try {
      if (!editingProduct) return;
      
      const formData = new FormData();
      formData.append('productId', editingProduct._id);
      formData.append('name', editingProduct.name);
      formData.append('description', editingProduct.description);
      formData.append('price', editingProduct.price);
      formData.append('category', editingProduct.category);
      formData.append('subCategory', editingProduct.subCategory);
      formData.append('bestseller', editingProduct.bestseller);
      
      // 处理图片更改
      Object.entries(imageChanges).forEach(([index, change]) => {
        if (change.toDelete) {
          formData.append(`deleteImage${index}`, 'true');
        } else if (change.file) {
          formData.append(`image${index}`, change.file);
        }
      });
      
      const response = await axios.post(
        backendUrl + '/api/product/update',
        formData,
        { 
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      if (response.data.success) {
        toast.success('产品信息已更新')
        setEditingProduct(null)
        setImageChanges({})
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  
  const handleEditChange = (field, value) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: value
    })
  }

  return (
    <>
      {/* 编辑产品对话框 */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">编辑产品信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">产品图片</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editingProduct.image.map((img, index) => {
                    const imageChange = imageChanges[index];
                    const isDeleted = imageChange?.toDelete;
                    const preview = imageChange?.preview;
                    
                    if (isDeleted) return null;
                    
                    return (
                      <div key={index} className="relative group">
                        <img 
                          src={preview || img} 
                          alt={`Product ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                            Change
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleImageChange(index, e)}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 添加新图片按钮 */}
                  {editingProduct.image.length < 4 && (
                    <div className="relative border-2 border-dashed rounded-lg h-32 flex items-center justify-center">
                      <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="block text-sm mt-1">Add Image</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageChange(editingProduct.image.length, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name || ''} 
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input 
                  type="number" 
                  value={editingProduct.price || ''} 
                  onChange={(e) => handleEditChange('price', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={editingProduct.category || 'Men'} 
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category</label>
                <select 
                  value={editingProduct.subCategory || 'Topwear'} 
                  onChange={(e) => handleEditChange('subCategory', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Topwear">Topwear</option>
                  <option value="Bottomwear">Bottomwear</option>
                  <option value="Winterwear">Winterwear</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={editingProduct.description || ''} 
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full border rounded px-3 py-2 h-32"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={editingProduct.bestseller || false} 
                    onChange={(e) => handleEditChange('bestseller', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Bestseller</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setEditingProduct(null)} 
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={saveProductEdit} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    
      <div className="flex justify-between items-center mb-4">
        <p className='text-lg font-medium'>All Products List</p>
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showDisabled} 
              onChange={() => setShowDisabled(!showDisabled)} 
              className="mr-2"
            />
            <span className="text-sm">Show Disabled Products</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {/* ------- List Table Title ---------- */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_2fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}
        {
          list.map((item, index) => (
            <div 
              className={`grid grid-cols-[1fr_3fr_1fr_1fr_1fr_2fr] items-center gap-2 py-1 px-2 border text-sm ${!item.enabled ? 'bg-gray-100 opacity-70' : ''}`} 
              key={index}
            >
              <img className='w-12' src={item.image[0]} alt="" />
              <div>
                <p>{item.name}</p>
                <p className="text-xs text-gray-500">ID: {item._id}</p>
              </div>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className='flex flex-col gap-1'>
                {Object.entries(item.sizes).map(([size, quantity]) => (
                  <div key={size} className='flex items-center gap-2'>
                    <span className='font-medium'>{size}:</span>
                    {editingStock?.productId === item._id && editingStock?.size === size ? (
                      <input
                        type="number"
                        min="0"
                        defaultValue={quantity}
                        className='w-16 border rounded px-1'
                        onBlur={(e) => {
                          const newQuantity = parseInt(e.target.value)
                          if (newQuantity >= 0) {
                            updateStock(item._id, size, newQuantity)
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const newQuantity = parseInt(e.target.value)
                            if (newQuantity >= 0) {
                              updateStock(item._id, size, newQuantity)
                            }
                          }
                        }}
                      />
                    ) : (
                      <span 
                        className='cursor-pointer hover:text-blue-600'
                        onClick={() => setEditingStock({ productId: item._id, size })}
                      >
                        {quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className='flex justify-end gap-2'>
                <button 
                  onClick={() => setEditingProduct(item)} 
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button 
                  onClick={() => toggleProductStatus(item._id)} 
                  className={`px-2 py-1 ${item.enabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs rounded`}
                >
                  {item.enabled ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={() => removeProduct(item._id)} 
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default List