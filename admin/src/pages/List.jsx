import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingStock, setEditingStock] = useState(null)

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
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

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>
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
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr_2fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
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
              <div className='flex justify-center gap-2'>
                <p onClick={() => removeProduct(item._id)} className='cursor-pointer text-lg'>X</p>
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default List