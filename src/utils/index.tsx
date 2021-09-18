import { IPrice, IProduct, IFormData } from 'src/types'

type QueryInput = Pick<IFormData, 'currency' | 'interval'>

export const getActiveProductPrice = (
  product: IProduct,
  { currency, interval }: QueryInput
) => {
  return product.prices.find((price: IPrice) => {
    let match = true

    if (currency) {
      match = price.currency === currency
    }
    if (interval) {
      match = price.recurring.interval === interval
    }

    return match
  })
}
