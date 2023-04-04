export type ColorComponent = 'nav' | 'background' | 'primary' | 'success' | 'danger'
export type ColorAugment = 'light' | 'normal' | 'heavy'

export type ColorConfig = {
  [option in ColorComponent]: {
    [augment in ColorAugment]: `#${string}`
  }
}
