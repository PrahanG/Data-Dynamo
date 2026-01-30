"use client"

import { useState, useEffect } from "react"
import { useRouteStore } from "@/store/route-store"
import { useOptimizationStore } from "@/store/optimization-store"
import type { Warehouse, DeliveryStop } from "@/store/route-store"

export interface Order {
    id: number
    retailId: number
    productId: number
    quantity: number
    deliveryDate: string
    status: string
    totalWeight: number
    priority: string
    createdAt: string
    retail?: {
        name: string
        address: string
    }
    product?: {
        name: string
        category: string
        weight: number
    }
}

// Enhanced Orders Panel Component with Warehouse Stop Management and Route Sync
interface OrdersPanelProps {
    minimized?: boolean
    onToggle?: () => void
    className?: string
}

export function OrdersPanel({ minimized = false, onToggle, className = "" }: OrdersPanelProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loading, setLoading] = useState(true)
    const [warehousesLoading, setWarehousesLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set())
    // Internal state only used if not controlled
    const [internalExpanded, setInternalExpanded] = useState(true)

    const isExpanded = onToggle ? !minimized : internalExpanded
    const handleToggle = onToggle || (() => setInternalExpanded(prev => !prev))

    const [showFilters, setShowFilters] = useState(false)
    const [activeTab, setActiveTab] = useState<'orders' | 'stops'>('orders')
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set(['pending', 'confirmed', 'in_transit', 'delivered']))
    const [showAddStopModal, setShowAddStopModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Route store integration
    const {
        deliveryStops,
        addDeliveryStop,
        removeDeliveryStop,
        reorderStop,
        toggleStopCompletion,
    } = useRouteStore()

    const { boxes } = useOptimizationStore()

    // Load orders from API
    const loadOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/orders')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setOrders(data)
            setError(null)
        } catch (err) {
            console.error('Failed to load orders:', err)
            setError(err instanceof Error ? err.message : 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    // Load warehouses from API
    const loadWarehouses = async () => {
        try {
            setWarehousesLoading(true)
            const response = await fetch('/api/warehouses')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            if (result.success) {
                setWarehouses(result.data)
            } else {
                throw new Error('Failed to fetch warehouses')
            }
        } catch (err) {
            console.error('Failed to load warehouses:', err)
            setError(err instanceof Error ? err.message : 'Failed to load warehouses')
        } finally {
            setWarehousesLoading(false)
        }
    }

    // Filter orders based on selected statuses and search query
    useEffect(() => {
        let filtered = orders.filter(order => selectedStatuses.has(order.status))

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(order => {
                const productName = order.product?.name || ''
                const retailerName = order.retail?.name || ''
                const orderId = order.id.toString()

                return (
                    productName.toLowerCase().includes(query) ||
                    retailerName.toLowerCase().includes(query) ||
                    orderId.includes(query)
                )
            })
        }

        setFilteredOrders(filtered)
    }, [orders, selectedStatuses, searchQuery])

    // Load initial data
    useEffect(() => {
        loadOrders()
        loadWarehouses()
    }, [])

    // Update order status
    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            setUpdatingStatus(prev => new Set(prev).add(orderId))

            const response = await fetch(`/api/orders`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            )
        } catch (err) {
            console.error('Failed to update order status:', err)
            alert('Failed to update order status: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setUpdatingStatus(prev => {
                const newSet = new Set(prev)
                newSet.delete(orderId)
                return newSet
            })
        }
    }

    // Get box count and weight for a stop
    const getStopBoxCount = (stopName: string) => {
        return boxes.filter(box => box.destination === stopName).length
    }

    const getStopWeight = (stopName: string) => {
        return boxes
            .filter(box => box.destination === stopName)
            .reduce((sum, box) => sum + box.weight, 0)
    }

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        setSelectedStatuses(prev => {
            const newSet = new Set(prev)
            if (newSet.has(status)) {
                newSet.delete(status)
            } else {
                newSet.add(status)
            }
            return newSet
        })
    }

    // Select all statuses
    const selectAllStatuses = () => {
        setSelectedStatuses(new Set(['pending', 'confirmed', 'in_transit', 'delivered']))
    }

    // Clear all status filters
    const clearAllStatusFilters = () => {
        setSelectedStatuses(new Set())
    }

    // Clear search
    const clearSearch = () => {
        setSearchQuery('')
    }

    // Utility functions for styling
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-900/30'
            case 'confirmed': return 'text-blue-400 bg-blue-900/30'
            case 'in_transit': return 'text-orange-400 bg-orange-900/30'
            case 'delivered': return 'text-green-400 bg-green-900/30'
            default: return 'text-gray-400 bg-gray-900/30'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400'
            case 'normal': return 'text-blue-400'
            case 'low': return 'text-green-400'
            default: return 'text-gray-400'
        }
    }

    const getFilterButtonColor = (status: string) => {
        const isSelected = selectedStatuses.has(status)
        switch (status) {
            case 'pending':
                return isSelected ? 'bg-yellow-600 text-white' : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/50'
            case 'confirmed':
                return isSelected ? 'bg-blue-600 text-white' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
            case 'in_transit':
                return isSelected ? 'bg-orange-600 text-white' : 'bg-orange-900/30 text-orange-400 hover:bg-orange-800/50'
            case 'delivered':
                return isSelected ? 'bg-green-600 text-white' : 'bg-green-900/30 text-green-400 hover:bg-green-800/50'
            default:
                return isSelected ? 'bg-gray-600 text-white' : 'bg-gray-900/30 text-gray-400 hover:bg-gray-800/50'
        }
    }

    const statusOptions = ['pending', 'confirmed', 'in_transit', 'delivered']

    return (
        <div className={`${className} ${!className.includes('absolute') ? 'absolute top-4 left-4' : ''} z-20 transition-all duration-300 ${isExpanded ? 'w-96' : 'w-auto'}`}>
            {!isExpanded ? (
                <button
                    onClick={handleToggle}
                    className="bg-gray-900/90 text-white p-3 rounded-lg border border-gray-600 shadow-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                    title="Show Orders"
                >
                    <span className="text-xl">📦</span>
                    <span className="font-semibold text-sm hidden md:block">Orders</span>
                </button>
            ) : (
                <div className="w-full max-h-[80vh] bg-gray-900/95 text-white rounded-lg border border-gray-600 shadow-xl backdrop-blur-sm flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-cyan-400">
                                {activeTab === 'orders' ? '📦 Orders' : '🚛 Route Planning'}
                            </h3>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                {activeTab === 'orders' ? `${filteredOrders.length}/${orders.length}` : deliveryStops.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {activeTab === 'orders' && (
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-2 py-1 rounded text-xs transition-colors ${showFilters ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                    title="Filter orders"
                                >
                                    🔽
                                </button>
                            )}
                            <button
                                onClick={activeTab === 'orders' ? loadOrders : loadWarehouses}
                                disabled={loading || warehousesLoading}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                                {(loading || warehousesLoading) ? '🔄' : '↻'}
                            </button>
                            <button
                                onClick={handleToggle}
                                className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                            >
                                −
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    {isExpanded && (
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'orders'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                📦 Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('stops')}
                                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'stops'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                🚛 Route Stops
                            </button>
                        </div>
                    )}

                    {/* Search Bar - Orders Only */}
                    {isExpanded && activeTab === 'orders' && (
                        <div className="p-4 border-b border-gray-700 bg-gray-800/30">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by product name, retailer, or order ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 pl-8 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                />
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    🔍
                                </div>
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        title="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <div className="mt-2 text-xs text-gray-400">
                                    {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter Panel - Orders Only */}
                    {showFilters && isExpanded && activeTab === 'orders' && (
                        <div className="p-4 border-b border-gray-700 bg-gray-800/30">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-cyan-300">Filter by Status</h4>
                                <div className="flex gap-1">
                                    <button
                                        onClick={selectAllStatuses}
                                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={clearAllStatusFilters}
                                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                    >
                                        None
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => toggleStatusFilter(status)}
                                        className={`px-3 py-2 rounded text-xs font-medium transition-colors ${getFilterButtonColor(status)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{status.replace('_', ' ').toUpperCase()}</span>
                                            <span className="text-xs opacity-75">
                                                {orders.filter(o => o.status === status).length}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-3 text-xs text-gray-400">
                                {selectedStatuses.size === 0 ? (
                                    <span className="text-red-400">No statuses selected - showing 0 orders</span>
                                ) : selectedStatuses.size === statusOptions.length ? (
                                    <span>Showing all statuses</span>
                                ) : (
                                    <span>Showing {selectedStatuses.size} of {statusOptions.length} statuses</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {isExpanded && (
                        <div className="p-4">
                            {/* Error State */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
                                    <div className="font-medium">⚠️ Error loading data</div>
                                    <div className="mt-1 text-xs">{error}</div>
                                    <button
                                        onClick={activeTab === 'orders' ? loadOrders : loadWarehouses}
                                        className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {(loading || warehousesLoading) && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                                    <span className="ml-2 text-gray-400">
                                        Loading {activeTab === 'orders' ? 'orders' : 'warehouses'}...
                                    </span>
                                </div>
                            )}

                            {/* Orders Tab Content */}
                            {activeTab === 'orders' && !loading && !error && (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {filteredOrders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <div className="text-2xl mb-2">📭</div>
                                            <div>
                                                {searchQuery ? (
                                                    <>No orders match "{searchQuery}"</>
                                                ) : selectedStatuses.size === 0 ? (
                                                    'No status filters selected'
                                                ) : (
                                                    'No orders match the selected filters'
                                                )}
                                            </div>
                                            <div className="flex gap-2 justify-center mt-3">
                                                {searchQuery && (
                                                    <button
                                                        onClick={clearSearch}
                                                        className="px-3 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-700"
                                                    >
                                                        Clear Search
                                                    </button>
                                                )}
                                                {selectedStatuses.size === 0 && (
                                                    <button
                                                        onClick={selectAllStatuses}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                    >
                                                        Show All Statuses
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <div key={order.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="text-sm font-medium text-white">Order #{order.id}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {order.product?.name || `Product ${order.productId}`}
                                                        </div>
                                                    </div>
                                                    <div className={`text-xs px-2 py-1 rounded ${getPriorityColor(order.priority)}`}>
                                                        {order.priority.toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-xs text-gray-300 mb-3">
                                                    <div className="flex justify-between">
                                                        <span>Quantity:</span>
                                                        <span className="text-white">{order.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Weight:</span>
                                                        <span className="text-white">{order.totalWeight} lbs</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Delivery:</span>
                                                        <span className="text-white">
                                                            {new Date(order.deliveryDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {order.retail && (
                                                        <div className="flex justify-between">
                                                            <span>Retailer:</span>
                                                            <span className="text-white truncate max-w-32" title={order.retail.name}>
                                                                {order.retail.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">Status:</span>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        disabled={updatingStatus.has(order.id)}
                                                        className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status.replace('_', ' ').toUpperCase()}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {updatingStatus.has(order.id) && (
                                                        <div className="animate-spin w-4 h-4 border border-cyan-400 border-t-transparent rounded-full"></div>
                                                    )}
                                                </div>

                                                <div className={`mt-2 px-2 py-1 rounded text-xs text-center ${getStatusColor(order.status)}`}>
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Enhanced Route Stops Tab Content */}
                            {activeTab === 'stops' && !warehousesLoading && !error && (
                                <div className="space-y-3">
                                    {/* Add Stop Button */}
                                    <button
                                        onClick={() => setShowAddStopModal(true)}
                                        className="w-full py-2 px-4 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                    >
                                        + Add Warehouse Stop
                                    </button>

                                    {/* Route Overview */}
                                    {deliveryStops.length > 0 && (
                                        <div className="mb-4 p-3 bg-gray-800/30 rounded border border-gray-700">
                                            <h4 className="text-sm font-medium text-cyan-400 mb-2">Route Overview</h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Total Stops:</span>
                                                    <span className="text-white">{deliveryStops.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Completed:</span>
                                                    <span className="text-green-400">
                                                        {deliveryStops.filter(s => s.isCompleted).length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Total Boxes:</span>
                                                    <span className="text-white">
                                                        {deliveryStops.reduce((sum, stop) => sum + getStopBoxCount(stop.name), 0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Total Weight:</span>
                                                    <span className="text-white">
                                                        {deliveryStops.reduce((sum, stop) => sum + getStopWeight(stop.name), 0).toLocaleString()} lbs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Stops List */}
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {deliveryStops.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <div className="text-2xl mb-2">🏭</div>
                                                <div>No delivery stops added</div>
                                                <div className="text-xs mt-2">Add warehouse stops to enable box destination assignment</div>
                                            </div>
                                        ) : (
                                            deliveryStops.map((stop, index) => {
                                                const boxCount = getStopBoxCount(stop.name)
                                                const weight = getStopWeight(stop.name)

                                                return (
                                                    <div key={stop.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${stop.isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                                                                    }`}>
                                                                    {stop.order}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-white">{stop.warehouse.name}</div>
                                                                    <div className="text-xs text-gray-400">{stop.warehouse.address}</div>
                                                                    <div className="text-xs text-cyan-400 font-medium">{stop.name}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {index > 0 && (
                                                                    <button
                                                                        onClick={() => reorderStop(stop.id, 'up')}
                                                                        className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
                                                                        title="Move up"
                                                                    >
                                                                        ↑
                                                                    </button>
                                                                )}
                                                                {index < deliveryStops.length - 1 && (
                                                                    <button
                                                                        onClick={() => reorderStop(stop.id, 'down')}
                                                                        className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
                                                                        title="Move down"
                                                                    >
                                                                        ↓
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => removeDeliveryStop(stop.id)}
                                                                    className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                                                    title="Remove stop"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Stop Details */}
                                                        <div className="space-y-1 text-xs text-gray-300 mb-3">
                                                            <div className="flex justify-between">
                                                                <span>Assigned Boxes:</span>
                                                                <span className={`font-medium ${boxCount > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                                                    {boxCount} boxes
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Total Weight:</span>
                                                                <span className="text-white">{weight.toLocaleString()} lbs</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Capacity:</span>
                                                                <span className="text-white">{stop.warehouse.capacity?.toLocaleString()} units</span>
                                                            </div>
                                                            {stop.warehouse.coordinates && (
                                                                <div className="flex justify-between">
                                                                    <span>Location:</span>
                                                                    <span className="text-white font-mono text-xs">
                                                                        {stop.warehouse.coordinates.lat.toFixed(2)}, {stop.warehouse.coordinates.lng.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => toggleStopCompletion(stop.id)}
                                                                className={`flex-1 py-1 px-2 rounded text-xs transition-colors ${stop.isCompleted
                                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                                    : 'bg-gray-600 text-white hover:bg-gray-500'
                                                                    }`}
                                                            >
                                                                {stop.isCompleted ? '✓ Completed' : 'Mark Complete'}
                                                            </button>
                                                        </div>

                                                        {/* Box Assignment Warning */}
                                                        {boxCount === 0 && (
                                                            <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-xs text-yellow-400">
                                                                ⚠️ No boxes assigned to this stop
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>

                                    {/* Route Summary */}
                                    {deliveryStops.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-700 text-xs">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Total Stops:</span>
                                                <span className="text-white">{deliveryStops.length}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Completed:</span>
                                                <span className="text-green-400">
                                                    {deliveryStops.filter(stop => stop.isCompleted).length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Remaining:</span>
                                                <span className="text-orange-400">
                                                    {deliveryStops.filter(stop => !stop.isCompleted).length}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Orders Summary - Orders Tab Only */}
                            {activeTab === 'orders' && !loading && !error && orders.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-700 text-xs">
                                    <div className="grid grid-cols-2 gap-2 text-gray-400">
                                        {statusOptions.map((status) => (
                                            <div key={status} className={selectedStatuses.has(status) ? getStatusColor(status).split(' ')[0] : ''}>
                                                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}: {orders.filter(o => o.status === status).length}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add Stop Modal */}
                    {showAddStopModal && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 w-80 max-h-96 overflow-y-auto">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Add Warehouse Stop</h3>

                                {warehouses.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400">
                                        No warehouses available
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {warehouses.map((warehouse) => {
                                            const isAlreadyAdded = deliveryStops.some(stop => stop.warehouseId === warehouse.id)
                                            return (
                                                <button
                                                    key={warehouse.id}
                                                    onClick={() => addDeliveryStop(warehouse)}
                                                    disabled={isAlreadyAdded}
                                                    className={`w-full text-left p-3 rounded border transition-colors ${isAlreadyAdded
                                                        ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-cyan-400'
                                                        }`}
                                                >
                                                    <div className="font-medium">{warehouse.name}</div>
                                                    <div className="text-sm text-gray-400">{warehouse.address}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Capacity: {warehouse.capacity?.toLocaleString()} units
                                                        {isAlreadyAdded && ' (Already added)'}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setShowAddStopModal(false)}
                                        className="flex-1 py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
