import { API_BASE_URL } from '../lib/api';

const BASE_URL = `${API_BASE_URL}/statistics-data`;

async function handleResponse(response) {
  // If response is null (aborted), return a specific indicator
  if (!response) {
    return { data: null, error: 'Request aborted', aborted: true };
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  // If the response has a 'data' property (array), return it as data, and pass through summary if present
  if (Array.isArray(data)) {
    return { data, error: null };
  } else if (data && Array.isArray(data.data)) {
    // Return all pagination fields if present
    return {
      data: data.data,
      summary: data.summary,
      total: data.total,
      totalPages: data.totalPages,
      page: data.page,
      limit: data.limit,
      error: null,
    };
  } else {
    return { data, error: null };
  }
}

function buildQueryString(query) {
  const params = new URLSearchParams();

  for (const key in query) {
    if (Array.isArray(query[key])) {
      // Handle arrays by adding multiple entries for the same key
      query[key].forEach((val) => {
        if (val !== '' && val != null) {
          params.append(key, val);
        }
      });
    } else if (query[key] !== '' && query[key] != null) {
      params.append(key, query[key]);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const statisticsDataService = {
  // Get all records (with optional filters and pagination)
  async getAll(filters = null, page = 1, limit = 10, signal = null) {
    let response = null;
    try {
      let query = filters ? { ...filters } : {};
      query.page = page;
      query.limit = limit;
      const queryParams = buildQueryString(query);
      response = await fetch(`${BASE_URL}${queryParams}`, {
        signal,
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      // Check if the error is due to abortion
      if (error.name === 'AbortError') {
        console.log('Fetch aborted (getAll)');
        return { data: null, error: 'Request aborted', aborted: true };
      }
      console.error('Error in getAll:', error);
      // Pass the response (if any) to handleResponse for consistent error structure
      return handleResponse(response).catch(() => ({
        data: null,
        error: error.message,
      }));
    }
  },

  // Get a single record by ID
  async getById(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create a new record
  async create(data) {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update an existing record
  async update(id, data) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Delete a record
  async remove(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Bulk delete records
  async bulkDelete(ids) {
    try {
      const response = await fetch(`${BASE_URL}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Import data from Excel
  async importData(data) {
    try {
      const response = await fetch(`${BASE_URL}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Export data with filters
  async exportData(filters = {}) {
    try {
      const response = await fetch(`${BASE_URL}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get filtered data
  async getFiltered(filters = {}, page = 1, limit = 10, signal = null) {
    let response = null;
    try {
      // Include pagination parameters in the filters
      const filterData = {
        ...filters,
        page,
        limit,
      };

      response = await fetch(`${BASE_URL}/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterData),
        signal, // Pass the signal here
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      // Check if the error is due to abortion
      if (error.name === 'AbortError') {
        console.log('Fetch aborted (getFiltered)');
        return { data: null, error: 'Request aborted', aborted: true };
      }
      console.error('Error in getFiltered:', error);
      // Pass the response (if any) to handleResponse for consistent error structure
      return handleResponse(response).catch(() => ({
        data: null,
        error: error.message,
      }));
    }
  },

  // Get all unique exam years
  async getExamYears() {
    try {
      const response = await fetch(`${BASE_URL}/years`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch exam years');
      }
      const data = await response.json();
      return { years: data.years || [], error: null };
    } catch (error) {
      return { years: [], error: error.message };
    }
  },
};
