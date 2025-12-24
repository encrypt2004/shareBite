import { client } from './client'

export const createClaim = async (listingId) => {
  const { data } = await client.post('/claims', { listing_id: listingId })
  return data
}

export const fetchMyClaims = async () => {
  const { data } = await client.get('/claims/my')
  return data
}

export const fetchClaimsForListing = async (listingId) => {
  const { data } = await client.get(`/claims/listing/${listingId}`)
  return data
}

export const submitQualityCheck = async (claimId, mediaUrls) => {
  const { data } = await client.post(`/claims/${claimId}/quality-check`, { media_urls: mediaUrls })
  return data
}

export const fetchNotifications = async () => {
  const { data } = await client.get('/notifications')
  return data
}

export const markNotificationRead = async (notificationId) => {
  const { data } = await client.post(`/notifications/${notificationId}/read`)
  return data
}
