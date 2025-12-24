import { client } from './client'

export const createListing = async (payload) => {
  const { data } = await client.post('/listings', payload)
  return data
}

export const fetchListings = async (params = {}) => {
  const { data } = await client.get('/listings', { params })
  return data
}

export const fetchMyListings = async () => {
  const { data } = await client.get('/listings/my')
  return data
}

export const fetchListingById = async (id) => {
  const { data } = await client.get(`/listings/${id}`)
  return data
}
