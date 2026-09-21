export interface StatisticsKpi {
  id: string
  label: string
  value: string
  badge: string
}

export interface MonthlyPoint {
  month: string
  revenue: number
  orders: number
}

export interface StatusShare {
  key: string
  label: string
  count: number
  percent: number
  color: string
}

export interface AdminStatistics {
  kpis: {
    totalRevenue: StatisticsKpi
    totalOrders: StatisticsKpi
    activeUsers: StatisticsKpi
    activeDrivers: StatisticsKpi
    restaurants: StatisticsKpi
    completionRate: StatisticsKpi
  }
  monthly: MonthlyPoint[]
  statusShares: StatusShare[]
}
