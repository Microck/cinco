export function detectDropsKey(data: Record<string, unknown>): string {
  const candidates = ['drops', 'upcomingItems', 'upcoming', 'releases']
  
  for (const key of candidates) {
    if (Array.isArray(data[key])) {
      return key
    }
  }
  
  const arrayKeys = Object.keys(data).filter(k => 
    k !== 'products' && Array.isArray(data[k])
  )
  
  return arrayKeys[0] || 'drops'
}

export interface SchemaField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  category: 'identity' | 'display' | 'status' | 'meta'
}

export function detectFields(sample: Record<string, unknown>): SchemaField[] {
  const fields: SchemaField[] = []
  
  const identityFields = ['id', 'name', 'code', 'title']
  const displayFields = ['imageUrl', 'image', 'price', 'brand', 'category']
  const statusFields = ['stock', 'status', 'available']
  
  for (const [key, value] of Object.entries(sample)) {
    let category: SchemaField['category'] = 'meta'
    
    if (identityFields.includes(key)) category = 'identity'
    else if (displayFields.includes(key)) category = 'display'
    else if (statusFields.includes(key)) category = 'status'
    
    let type: SchemaField['type'] = 'string'
    if (typeof value === 'number') type = 'number'
    else if (typeof value === 'boolean') type = 'boolean'
    else if (Array.isArray(value)) type = 'array'
    else if (typeof value === 'object' && value !== null) type = 'object'
    
    fields.push({ name: key, type, category })
  }
  
  return fields
}
