"use client"

import React, { useState } from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  mobileRender?: (item: T) => React.ReactNode // How this column renders on a mobile card
  sortable?: boolean
  hideOnMobile?: boolean
  align?: "left" | "center" | "right"
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  keyExtractor: (item: T) => string
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  onRowClick?: (item: T) => void
  pagination?: {
    pageSize: number
  }
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  selectable = false,
  onSelectionChange,
  onRowClick,
  pagination
}: DataTableProps<T>) {
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = selectedIds.includes(id) 
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]
    
    setSelectedIds(newSelected)
    onSelectionChange?.(newSelected)
  }

  const toggleAll = () => {
    const newSelected = selectedIds.length === data.length ? [] : data.map(keyExtractor)
    setSelectedIds(newSelected)
    onSelectionChange?.(newSelected)
  }

  // Pagination Logic
  const pageSize = pagination?.pageSize || 10
  const totalPages = Math.ceil(data.length / pageSize)
  const currentData = pagination 
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data

  return (
    <div className="flex flex-col w-full">
      
      {/* DESKTOP VIEW: Native Table */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface border-b text-muted-foreground">
            <tr>
              {selectable && (
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-muted cursor-pointer"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={`p-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.header}
                    {col.sortable && <ArrowUpDown className="h-3 w-3 opacity-50 ml-1" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentData.map((row) => (
              <tr 
                key={keyExtractor(row)} 
                className={`hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-muted cursor-pointer"
                      checked={selectedIds.includes(keyExtractor(row))}
                      onClick={(e) => toggleSelect(keyExtractor(row), e)}
                      readOnly
                    />
                  </td>
                )}
                {columns.map((col, i) => (
                  <td 
                    key={i} 
                    className={`p-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Stacked Cards */}
      <div className="flex flex-col md:hidden divide-y divide-border">
        {currentData.map((row) => (
          <div 
            key={keyExtractor(row)}
            className={`p-4 flex flex-col gap-3 hover:bg-muted/20 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            {/* Header row of card: Select box + Main identifier */}
            <div className="flex items-start gap-3">
              {selectable && (
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    className="rounded border-muted cursor-pointer h-5 w-5"
                    checked={selectedIds.includes(keyExtractor(row))}
                    onClick={(e) => toggleSelect(keyExtractor(row), e)}
                    readOnly
                  />
                </div>
              )}
              {/* Try to render the first visible column as the primary title */}
              <div className="flex-1">
                {columns[0].cell ? columns[0].cell(row) : (columns[0].accessorKey ? String(row[columns[0].accessorKey]) : null)}
              </div>
            </div>

            {/* Remaining properties */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 pl={selectable ? 8 : 0} text-xs">
              {columns.slice(1).map((col, i) => {
                if (col.hideOnMobile) return null
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">{col.header}</span>
                    <div className="font-semibold text-foreground">
                      {col.mobileRender ? col.mobileRender(row) : (col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : null))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50">
          <span>Showing {currentData.length} of {data.length} entries</span>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-bold">{currentPage}</span>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
