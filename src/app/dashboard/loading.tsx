export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-muted/50 rounded-lg w-1/4 mb-8"></div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-xl"></div>
        ))}
      </div>
      
      <div className="h-48 bg-muted/50 rounded-xl mt-8"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 bg-muted/50 rounded-xl"></div>
          <div className="h-64 bg-muted/50 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-muted/50 rounded-xl"></div>
          <div className="h-40 bg-muted/50 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
