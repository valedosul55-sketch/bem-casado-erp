import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterOptions {
  searchQuery: string;
  category: string;
  priceRange: [number, number];
  sortBy: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc';
  onlyPromotions: boolean;
}

interface SearchAndFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchAndFilters({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: SearchAndFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as FilterOptions['sortBy'],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      category: 'all',
      priceRange: [0, 50],
      sortBy: 'name-asc',
      onlyPromotions: false,
    });
  };

  const handleTogglePromotions = () => {
    onFiltersChange({ ...filters, onlyPromotions: !filters.onlyPromotions });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 50 ||
    filters.sortBy !== 'name-asc' ||
    filters.onlyPromotions;

  return (
    <Card className="p-4 bg-white shadow-md">
      <div className="space-y-4">
        {/* Linha principal: Busca e botão de filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou marca..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant={filters.onlyPromotions ? 'default' : 'outline'}
            onClick={handleTogglePromotions}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
          >
            <Filter className="h-4 w-4" />
            Promoções
          </Button>

          <Button
            variant={isExpanded ? 'default' : 'outline'}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {[
                  filters.searchQuery !== '',
                  filters.category !== 'all',
                  filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50,
                  filters.sortBy !== 'name-asc',
                  filters.onlyPromotions,
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Painel de filtros expandido */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Filtro de categoria */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categoria
              </label>
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="arroz">Arroz</SelectItem>
                  <SelectItem value="feijao">Feijão</SelectItem>
                  <SelectItem value="acucar">Açúcar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de faixa de preço */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Faixa de Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
              </label>
              <Slider
                min={0}
                max={50}
                step={1}
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                className="mt-2"
              />
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Ordenar por</label>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="stock-desc">Maior Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Resultados e botão limpar */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Mostrando <strong>{resultCount}</strong> de <strong>{totalCount}</strong> produtos
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
