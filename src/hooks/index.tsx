import { usePriceBlocsContext } from 'src'
import { getActiveProductPrice } from 'src/utils'

export const useActiveProductPrice = (productId: string) => {
  const {
    values: {
      products,
      form: { currency, interval },
    },
  } = usePriceBlocsContext()
  const product = products.find(({ id }) => id === productId)

  return product && getActiveProductPrice(product, { currency, interval })
}
