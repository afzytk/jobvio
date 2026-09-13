// JSearch free-tier plans only expose /search-v2 (data.jobs), not /search.
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'external_jobs_cache_v2_';

const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

/**
 * Get cached jobs from localStorage
 */
const getCachedJobs = (location) => {
  const cacheKey = `${CACHE_KEY_PREFIX}${location || 'all'}`;
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error parsing cached jobs:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Cache jobs to localStorage
 */
const cacheJobs = (jobs, location) => {
  const cacheKey = `${CACHE_KEY_PREFIX}${location || 'all'}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: jobs,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching jobs:', error);
  }
};

const cleanupLegacyCaches = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('external_jobs_cache_') && !key.startsWith(CACHE_KEY_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Non-fatal: localStorage may be unavailable in private browsing
  }
};

/**
 * Map API employment type to internal format
 */
const mapJobType = (apiType) => {
  const typeMap = {
    'FULLTIME': 'Full-time',
    'PARTTIME': 'Part-time',
    'CONTRACTOR': 'Contract',
    'INTERN': 'Internship'
  };
  return typeMap[apiType] || 'Full-time';
};

/**
 * Transform RapidAPI JSearch job to internal schema
 */
const transformApiJob = (apiJob) => ({
  id: apiJob.job_id,
  title: apiJob.job_title,
  company: apiJob.employer_name,
  location: apiJob.job_state || apiJob.job_city || 'India',
  description: apiJob.job_description || 'No description available',
  requirements: 'Apply to see full requirements',
  salary: apiJob.job_min_salary
    ? `${apiJob.job_min_salary} - ${apiJob.job_max_salary} ${apiJob.job_salary_period || ''}`.trim()
    : apiJob.job_salary || 'Not specified',
  type: mapJobType(apiJob.job_employment_type),
  posted_date: apiJob.job_posted_at_datetime_utc
    ? new Date(apiJob.job_posted_at_datetime_utc).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  external: true,
  apply_url: apiJob.job_apply_link,
  logo_url: apiJob.employer_logo
});

/**
 * Fetch jobs from RapidAPI JSearch (/search-v2 endpoint)
 */
const fetchJobsFromAPI = async (location) => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('RapidAPI key not found in environment variables. External jobs will not be fetched.');
    return [];
  }

  const query = location ? `jobs in ${location}, India` : 'jobs in India';

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/search-v2?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) {
      console.error(`RapidAPI Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const result = await response.json();
    return result?.data?.jobs || result?.data || [];
  } catch (error) {
    console.error('Error fetching external jobs from RapidAPI:', error);
    return [];
  }
};

/**
 * Get external job listings from RapidAPI JSearch
 * Uses localStorage caching to minimize API calls
 */
export async function getExternalJobs(token, { location }) {
  cleanupLegacyCaches();

  const cached = getCachedJobs(location);
  if (cached) return cached;

  const apiJobs = await fetchJobsFromAPI(location);
  const transformedJobs = apiJobs.map(transformApiJob);

  cacheJobs(transformedJobs, location);

  return transformedJobs;
}

/**
 * Get a single external job by ID
 * Searches through all cached locations
 */
export async function getExternalJobById(token, { job_id }) {
  const allCacheKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_KEY_PREFIX));

  for (const key of allCacheKeys) {
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached && cached.data) {
        const job = cached.data.find(j => j.id === job_id);
        if (job) return job;
      }
    } catch (error) {
      console.error('Error reading cache key:', key, error);
    }
  }

  return null;
}
