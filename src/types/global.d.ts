export {}

declare global {
  interface Window {
    __CS_ID__: string
  }
  const __CS_ID__: Window.__CS_ID__
}
