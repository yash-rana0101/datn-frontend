'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    condition: 'all',
    sortBy: 'relevance'
  });

  const categories = [
    'All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Toys', 'Automotive'
  ];

  const mockProducts = Array.from({ length: 12 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Product ${i + 1}`,
    description: 'High-quality product with excellent features and condition',
    price: `${(i + 1) * 50}`,
    image: '/product-placeholder.jpg',
    category: categories[i % categories.length].toLowerCase(),
    seller: `0x${(i + 1).toString(16).padStart(8, '0')}`,
    status: 'active' as const,
    views: (i + 1) * 100,
    favorites: (i + 1) * 10
  }));

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Search Products</h1>
          <p className="text-gray-400">Find the perfect item from our marketplace</p>
        </div>

        {/* Search Bar */}
        <Card className="glass-neo p-4 border-gray-800 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#C6D870] text-black hover:bg-[#B5C760] h-12 px-6"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="glass-neo p-6 border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg glass hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={filters.category === cat.toLowerCase() ? 'lime' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFilters({ ...filters, category: cat.toLowerCase() })}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6D870]"
                >
                  <option value="all">All Prices</option>
                  <option value="0-100">0 - 100 DATN</option>
                  <option value="100-500">100 - 500 DATN</option>
                  <option value="500-1000">500 - 1000 DATN</option>
                  <option value="1000+">1000+ DATN</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6D870]"
                >
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6D870]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setFilters({ category: 'all', priceRange: 'all', condition: 'all', sortBy: 'relevance' })}
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5"
              >
                Reset Filters
              </Button>
              <Button className="bg-[#C6D870] text-black hover:bg-[#B5C760]">
                Apply Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-white">
              <span className="font-semibold">{mockProducts.length}</span>
              <span className="text-gray-400 ml-1">results found</span>
            </p>

            {/* Quick Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5"
              >
                <Clock className="w-4 h-4 mr-1" />
                New
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Best Price
              </Button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 glass rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid'
                  ? 'bg-[#C6D870] text-black'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list'
                  ? 'bg-[#C6D870] text-black'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }`}>
          {mockProducts.map((product) => (
            <ProductCard key={product.id} {...product} variant={viewMode === 'list' ? 'compact' : 'default'} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-[#C6D870] text-black hover:bg-[#B5C760] px-12"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  );
}
