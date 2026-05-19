import type { UserConfig } from 'vite'

export function createManualChunks(id: string): string | undefined {
  if (!id.includes('node_modules'))
    return undefined

  if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/'))
    return 'vendor-react'

  if (id.includes('/@ant-design/pro-components/') || id.includes('/@ant-design/pro-'))
    return 'vendor-ant-design-pro'

  if (id.includes('/@ant-design/icons/'))
    return 'vendor-icons'

  if (id.includes('/antd/'))
    return 'vendor-ant-design'

  return 'vendor'
}

export const sharedBuildConfig: UserConfig['build'] = {
  chunkSizeWarningLimit: 1300,
  rollupOptions: {
    output: {
      manualChunks: createManualChunks,
    },
  },
}
