interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface TabNavProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  badges?: Record<string, number>
}

export default function TabNav({ tabs, activeTab, onTabChange, badges }: TabNavProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      backgroundColor: '#F3F4F6',
      borderRadius: '10px',
      marginBottom: '24px'
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const badge = badges?.[tab.id]
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? '#1F2937' : '#6B7280',
              fontSize: '0.875rem',
              fontWeight: isActive ? '600' : '500',
              cursor: 'pointer',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon}
            {tab.label}
            {badge !== undefined && badge > 0 && (
              <span style={{
                padding: '2px 6px',
                backgroundColor: isActive ? '#2563EB' : '#E5E7EB',
                color: isActive ? '#FFFFFF' : '#6B7280',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
