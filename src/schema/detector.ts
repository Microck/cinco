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

export function mergeWithSchema(
  newItem: Record<string, unknown>, 
  existingItems: Record<string, unknown>[]
): Record<string, unknown> {
  if (existingItems.length === 0) return newItem

  const schemaKeys = new Set<string>()
  const typeMap = new Map<string, string>()

  for (const item of existingItems) {
    for (const [key, value] of Object.entries(item)) {
      schemaKeys.add(key)
      if (value !== null && value !== undefined) {
        typeMap.set(key, typeof value)
      }
    }
  }

  const result: Record<string, unknown> = {}

  for (const key of schemaKeys) {
    const type = typeMap.get(key)
    if (type === 'number') result[key] = 0
    else if (type === 'boolean') result[key] = false
    else if (type === 'object') result[key] = null
    else result[key] = ''
  }

  Object.assign(result, newItem)

  return result
}
