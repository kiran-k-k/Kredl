import React from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Oracle", "Adobe", "Salesforce", 
  "Nvidia", "IBM", "TCS", "Infosys", "Accenture", "Capgemini", "Cognizant", "Wipro"
]

export default function StepDreamCompanies({ data, updateData }: Props) {
  const [search, setSearch] = React.useState("")

  const toggleCompany = (company: string) => {
    if (data.preferredCompanies.includes(company)) {
      updateData({ preferredCompanies: data.preferredCompanies.filter(c => c !== company) })
    } else {
      updateData({ preferredCompanies: [...data.preferredCompanies, company] })
    }
  }

  const filtered = COMPANIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">3. Select your dream companies</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search Companies</Label>
          <Input 
            placeholder="Type to search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Suggested Companies</Label>
          <div className="flex flex-wrap gap-2 mt-2 max-h-64 overflow-y-auto p-1">
            {filtered.map(company => (
              <Badge 
                key={company} 
                variant={data.preferredCompanies.includes(company) ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3"
                onClick={() => toggleCompany(company)}
              >
                {company}
              </Badge>
            ))}
            {filtered.length === 0 && (
              <span className="text-sm text-muted-foreground">No companies found.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
