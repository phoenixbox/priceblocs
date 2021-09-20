import * as React from 'react'
import { Stripe } from '@stripe/stripe-js'

export interface ICustomerParams {
  customer?: string
  customer_email?: string
  email?: string
}

export interface IFetchConfigParams extends ICustomerParams {
  [key: string]: string | string[]
  prices?: string[]
  id?: string
  session?: string
}

export interface ICheckoutProps {
  prices: [string]
}

export interface IMetadata {
  id: string
}

export interface ICheckoutData extends ICustomerParams {
  prices: [string]
  cancel_url: string
  success_url?: string
  return_url?: string
  id?: string
  session?: string
}

export interface ICheckoutProps extends ICheckoutData {
  metadata: IMetadata
}

export interface IPriceBlocsContextProps extends ICustomerParams {
  children: React.ReactNode | ((props: IPriceBlocsProviderValue) => any)
  api_key: string
  prices?: string[]
  success_url?: string
  cancel_url?: string
  return_url?: string
}

export interface IAdmin {
  clientKey: string
}

export interface IRecurring {
  interval: string
}

export interface IPrice {
  id: string
  currency: string
  recurring: IRecurring | null
}

export interface IProduct {
  id: string
  name: string
  description?: string
  prices?: IPrice[]
}

export interface IHighlight {
  price?: string
  product?: string
  label?: string
  style?: string
}

export interface IPresentation {
  interval?: string
  license?: string
}

export interface IColors {
  primary?: string
}

export interface ITheme {
  colors?: IColors
  license?: string
}

export interface IFormData {
  currencies: string[]
  currency: string
  intervals: string[]
  interval: string
  highlight: IHighlight
  theme: ITheme
  presentation: IPresentation
}

export interface IValues {
  admin: IAdmin
  form: IFormData
  products: IProduct[]
}

export interface IErrors {
  config: Error
}

export interface IPriceBlocsProviderValue {
  ready: boolean
  loading: boolean
  isSubmitting: boolean
  values?: IValues
  metadata?: IMetadata | null
  errors?: IErrors
  setValues: (values: IValues) => void
  setFieldValue: (path: string, value: any) => any
  refetch: () => void
  checkout: ({ prices }: ICheckoutProps, stripe: Stripe | null) => void
}

export interface IPriceBlocsContext {
  Context: React.Context<null>
  ContextProvider: IPriceBlocsProvider | React.Provider<null>
  ContextConsumer: React.Consumer<null>
  useContext: () => IPriceBlocsProviderValue
}

export interface IPriceBlocsProvider extends React.FC {
  value?: IPriceBlocsProviderValue
  children?: React.ReactNode
}

export interface IStripeElementContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  clientKey: string
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IWithStripeContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IAuthHeaders {
  [key: string]: string
}

export interface IProductConfig {
  [key: string]: {
    enabled: boolean
  } | null
}

export interface IFeature {
  title: string
  tooltip: string | null
  product_config: IProductConfig
}

export interface IFeatureGroup {
  title: string
  features: IFeature[]
}

export interface IFeatureTableHeader {
  id: string
  title: string
}

export interface IFeatureTableGroupColumn {
  header: string
  accessor?: string
}

export interface IFeatureTableGroupRowTitle {
  value: string
  tooltip: string
}

export interface IFeatureTableGroupRow {
  [key: string]: IProductConfig | null | IFeatureTableGroupRowTitle | boolean
}

export interface IFeatureTableGroup {
  columns: IFeatureTableGroupColumn[]
  rows: IFeatureTableGroupRow[]
}

export interface IProductsFeatureTable {
  header: IFeatureTableHeader[]
  groups: IFeatureTableGroup[]
}
