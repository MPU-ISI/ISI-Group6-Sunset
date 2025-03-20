import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLanguage } from '../context/LanguageContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products , search , showSearch } = useContext(ShopContext);
  const { t } = useLanguage();
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.subCategory.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0 ) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    // 应用价格范围筛选
    if (priceRange.min !== '') {
      productsCopy = productsCopy.filter(item => item.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      productsCopy = productsCopy.filter(item => item.price <= Number(priceRange.max));
    }

    setFilterProducts(productsCopy);
    setCurrentPage(1);
  }

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }
  }

  // Handle pagination
  const paginate = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filterProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    setPaginatedProducts(currentProducts);
    setTotalPages(Math.ceil(filterProducts.length / productsPerPage));
  }

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  }

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  useEffect(()=>{
      applyFilter();
  },[category, subCategory, search, showSearch, products, priceRange])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  useEffect(() => {
    paginate();
  }, [filterProducts, currentPage, productsPerPage])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>{t('filters')}
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>{t('categories')}</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory}/> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory}/> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory}/> kids
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>{t('type')}</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory}/> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory}/> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory}/> Winterwear
            </p>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>{t('priceRange')}</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <div className='flex items-center gap-2'>
              <input 
                type="number" 
                name="min" 
                value={priceRange.min}
                onChange={handlePriceRangeChange}
                placeholder="Min"
                className='w-20 px-2 py-1 border rounded'
              />
              <span>-</span>
              <input 
                type="number" 
                name="max" 
                value={priceRange.max}
                onChange={handlePriceRangeChange}
                placeholder="Max"
                className='w-20 px-2 py-1 border rounded'
              />
            </div>
            <p className='text-xs text-gray-500'>{t('enterPriceRange')}</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={t('allCollections')} text2={''} />
            {/* Porduct Sort */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">{t('sortBy')} {t('relevant')}</option>
              <option value="low-high">{t('sortBy')} {t('lowToHigh')}</option>
              <option value="high-low">{t('sortBy')} {t('highToLow')}</option>
            </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            paginatedProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center mt-8 mb-6'>
            <div className='flex space-x-1'>
              {/* Previous Button */}
              <button 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} 
                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </button>
              
              {/* Page Numbers */}
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${currentPage === number ? 'bg-black text-white' : 'hover:bg-gray-100 border'}`}
                >
                  {number}
                </button>
              ))}
              
              {/* Next Button */}
              <button 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} 
                className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className='text-sm text-gray-500 text-center mb-4'>
          {t('showing')} {paginatedProducts.length} {t('of')} {filterProducts.length} {t('products')}
        </div>
      </div>

    </div>
  )
}

export default Collection
