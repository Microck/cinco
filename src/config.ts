import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env: ${key}`)
  }
  return value
}

export const config = {
  discord: {
    token: required('DISCORD_TOKEN'),
    clientId: required('DISCORD_CLIENT_ID'),
  },
  encryption: {
    key: required('ENCRYPTION_KEY'),
  },
  nvidiaApiKey: required('NVIDIA_API_KEY'),
  ownerId: process.env.OWNER_ID || '',
  monitorPort: parseInt(process.env.MONITOR_PORT || '3000', 10),
} as const
