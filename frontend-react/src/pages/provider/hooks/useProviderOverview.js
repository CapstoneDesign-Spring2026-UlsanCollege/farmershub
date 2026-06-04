import { getFarmServiceListings } from '../../../api/farmServiceListingsApi.js';
import { getProviderProfile } from '../../../api/providerApi.js';
import { getServiceRequests } from '../../../api/serviceRequestsApi.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { asArray } from '../../../utils/format.js';

export function useProviderOverview() {
  return useAsyncData(async () => {
    const [profileResult, listingsResult, requestsResult] = await Promise.allSettled([
      getProviderProfile(),
      getFarmServiceListings({ mine: 'true' }),
      getServiceRequests(),
    ]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : null,
      listings: listingsResult.status === 'fulfilled' ? asArray(listingsResult.value) : [],
      requests: requestsResult.status === 'fulfilled' ? asArray(requestsResult.value) : [],
      errors: [profileResult, listingsResult, requestsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, []);
}
