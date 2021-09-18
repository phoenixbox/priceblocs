import {
  IPrice,
  IProduct,
  IFormData,
  IFeature,
  IFeatureGroup,
  IFeatureTableGroupColumn,
  IProductConfig,
  IProductsFeatureTable,
} from 'src/types'

type QueryInput = Pick<IFormData, 'currency' | 'interval'>

export const getActiveProductPrice = (
  product: IProduct,
  { currency, interval }: QueryInput
): IPrice => {
  return product.prices.find((price: IPrice) => {
    let match = false
    const currencyMatch = price.currency === currency
    const intervalMatch = Boolean(
      price.recurring && price.recurring.interval === interval
    )

    if (currency && interval) {
      match = currencyMatch && intervalMatch
    } else if (currency) {
      match = currencyMatch
    } else if (interval) {
      match = intervalMatch
    }

    return match
  })
}

export const getProductFeatures = (
  productId: string,
  featureGroups: IFeatureGroup[]
): IFeature[] =>
  featureGroups.reduce((memo, featureGroup: IFeatureGroup) => {
    featureGroup.features &&
      featureGroup.features.forEach((feature: IFeature) => {
        const productConfig =
          feature.product_config &&
          feature.product_config[productId] &&
          feature.product_config[productId].enabled
        if (productConfig) {
          memo.push(feature)
        }
      })

    return memo
  }, [])

export const getProductsFeaturesTable = ({
  products,
  featureGroups,
}: {
  products: IProduct[]
  featureGroups: IFeatureGroup[]
}): IProductsFeatureTable => {
  return {
    header: products.map(({ name, id }) => ({
      id,
      title: name,
    })),
    groups: featureGroups.map((featureGroup) => ({
      columns: products.reduce(
        (memo, product) => {
          memo.push({ accessor: product.id } as IFeatureTableGroupColumn)
          return memo
        },
        [
          {
            header: featureGroup.title,
            accessor: 'title',
          },
        ] as IFeatureTableGroupColumn[]
      ),
      rows: featureGroup.features.map((feature) => {
        return {
          title: {
            value: feature.title,
            tooltip: feature.tooltip || null,
          },
          ...products.reduce((memo, product) => {
            const productConfig = feature.product_config[product.id]
            memo[product.id] = productConfig || null
            return memo
          }, {} as IProductConfig),
        }
      }),
    })),
  }
}
