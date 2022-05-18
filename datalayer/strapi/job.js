import axios from './client';
import qs from 'qs';

const apiUrl = process.env.STRAPI_API_BASE_URL;

export const getJobsSlugs = async () => {
  const query = qs.stringify(
    {
      fields: ['slug'],
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res = await axios.get(`${apiUrl}/jobs?${query}`);
  const rawSlugs = res.data.data;
  //   return rawSlugs;

  const slugs = rawSlugs.map((rawSlug) => {
    return rawSlug.attributes.slug;
  });
  return slugs;
};

export const getJobBySlug = async ({ slug }) => {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: [
        'company',
        'company.logo',
        'company.coverImage',
        'relatedJobs',
        'relatedJobs.company',
        'relatedJobs.company.logo',
        'relatedJobs.company.coverImage',
        'skillsTags',
      ],
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res = await axios.get(`${apiUrl}/jobs?${query}`);
  const rawJob = res.data.data[0];
  return rawJob;
};

export const getJobsByCompanyId = async ({ id }) => {
  const query = qs.stringify(
    {
      filters: {
        company: {
          id: {
            $eq: id,
          },
        },
      },
      populate: ['company', 'company.logo', 'company.coverImage', 'skillsTags'],
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res = await axios.get(`${apiUrl}/jobs?${query}`);
  const rawJobs = res.data.data;
  return rawJobs;
};

export const getJobs = async ({ page = 1, pageSize = 100 } = {}) => {
  const query = qs.stringify(
    {
      populate: ['company', 'company.logo', 'company.coverImage', 'skillsTags'],
      pagination: {
        page,
        pageSize,
      },
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res = await axios.get(`${apiUrl}/jobs?${query}`);
  const rawJobs = res.data.data;
  return rawJobs;
};

export const searchJobs = async (query) => {
  const strapiQuery = {
    populate: ['company', 'company.logo', 'company.coverImage', 'skillsTags'],
    filters: {},
  };

  // Add Boolean Query Filters
  if (query.remoteOkOnly) strapiQuery['filters']['remoteOk'] = { $eq: true };
  if (query.featuredJobsOnly)
    strapiQuery['filters']['featuredJob'] = { $eq: true };

  // Add Range Query Filters
  strapiQuery['filters']['baseAnnualSalary'] = {
    $gte: query.minBaseSalary,
    $lte: query.maxBaseSalary,
  };

  // Add Inclusion Query Filters
  strapiQuery['filters']['jobType'] = { $in: query.jobTypes };
  strapiQuery['filters']['experienceLevel'] = { $in: query.experienceLevels };

  //Add Nested Inclusion Query Filters
  if (query.selectedTags.length)
    strapiQuery['filters']['skillsTags'] = {
      name: { $in: query.selectedTags },
    };

  const strapiQueryStr = qs.stringify(strapiQuery, { encodeValuesOnly: true });
  const res = await axios.get(`${apiUrl}/jobs?${strapiQueryStr}`);
  const rawJobs = res.data.data;

  return rawJobs;
};
