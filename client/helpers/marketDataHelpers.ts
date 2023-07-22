import axios from 'axios'

export const fetchMarketPrices = async (tickers: string[]) => {
  const symbols = tickers.join(',')
  const fetchUrl = `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${process.env.TWELVE_DATA_SECRET_KEY}`

  const { data } = await axios.get(fetchUrl)
  return data
}
