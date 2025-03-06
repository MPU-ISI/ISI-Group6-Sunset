import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import Offers from '../Components/Offers/Offers'
import Popular from '../Components/Popular/Popular'
import SearchFilter from '../Components/SearchFilter/SearchFilter'

const Shop = () => {
  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories] = useState(['men', 'women', 'kids', 'accessories']);
  const [tags] = useState(['New', 'Sale', 'Trending', 'Casual', 'Formal', 'Sport']);

  const fetchInfo = () => {
    // 获取所有产品
    fetch('http://localhost:4000/api/products/all')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setFilteredProducts(data);
      });

    // 获取热门产品
    fetch('http://localhost:4000/api/products/popularinwomen')
      .then((res) => res.json())
      .then((data) => setPopular(data));

    // 获取新品系列
    fetch('http://localhost:4000/api/products/newcollections')
      .then((res) => res.json())
      .then((data) => setNewCollection(data));
  }

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleSearch = (filters) => {
    let results = [...allProducts];

    // 关键词搜索
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    // 分类筛选
    if (filters.category && filters.category !== 'all') {
      results = results.filter(product =>
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // 价格范围筛选
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      results = results.filter(product => {
        const price = parseFloat(product.price);
        const min = filters.priceRange.min !== '' ? filters.priceRange.min : -Infinity;
        const max = filters.priceRange.max !== '' ? filters.priceRange.max : Infinity;

        return price >= min && price <= max;
      });
    }

    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(product =>
        filters.tags.some(tag => product.tags && product.tags.includes(tag))
      );
    }

    setFilteredProducts(results);
  };

  return (
    <div>
      <Hero />
      <SearchFilter
        onSearch={handleSearch}
        categories={categories}
        tags={tags}
      />
      {filteredProducts.length > 0 ? (
        <div className="filtered-products">
          <Popular data={filteredProducts} />
        </div>
      ) : (
        <>
          <Popular data={popular} />
          <Offers />
          <NewCollections data={newcollection} />
        </>
      )}
      <NewsLetter />
    </div>
  )
}

export default Shop
