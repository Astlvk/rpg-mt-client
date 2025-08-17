import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
// import Prism from 'prismjs'
import type { App } from 'vue'

export function registerVMdEditor(app: App) {
  VMdPreview.use(vuepressTheme, {
    // Prism,
  })
  app.use(VMdPreview)
}
