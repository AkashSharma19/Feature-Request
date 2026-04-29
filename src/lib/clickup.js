/**
 * ClickUp Status Mapping
 * Maps ClickUp status names (case-insensitive) to our local application statuses.
 * Adjust these based on your ClickUp status names.
 */
const CLICKUP_STATUS_MAP = {
  'open': 'Open',
  'to do': 'Open',
  'in progress': 'In Progress',
  'in design': 'In Design',
  'under review': 'Under Review',
  'review': 'Under Review',
  'development': 'Development',
  'dev': 'Development',
  'testing': 'Testing',
  'qa': 'Testing',
  'tested': 'Tested',
  'complete': 'Closed',
  'closed': 'Closed',
  'done': 'Closed',
  'canceled': 'Cancelled',
  'cancelled': 'Cancelled'
};

/**
 * Fetch task status from ClickUp API
 * @param {string} taskId - The ClickUp Task ID
 * @param {string} apiKey - Your ClickUp API Key
 * @returns {Promise<{ status: string, name: string } | null>}
 */
export async function fetchClickUpTask(taskId, apiKey, teamId = null) {
  if (!taskId || !apiKey) return null;
  
  const cleanId = taskId.replace('#', '').trim();
  // If ID contains a hyphen, it's likely a custom task ID
  const isCustomId = cleanId.includes('-');
  
  let url = `https://api.clickup.com/api/v2/task/${cleanId}`;
  if (isCustomId && teamId) {
    url += `?custom_task_ids=true&team_id=${teamId}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.err || `ClickUp API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawStatus = data.status?.status?.toLowerCase() || '';
    
    // Try exact match, then partial match
    let mappedStatus = CLICKUP_STATUS_MAP[rawStatus];
    
    if (!mappedStatus) {
      // Try finding a key that is contained in the raw status or vice versa
      const match = Object.keys(CLICKUP_STATUS_MAP).find(key => 
        rawStatus.includes(key) || key.includes(rawStatus)
      );
      mappedStatus = match ? CLICKUP_STATUS_MAP[match] : null;
    }
    
    return {
      status: mappedStatus, // Return null if no match found so we can alert the user
      originalStatus: data.status?.status,
      taskName: data.name
    };
  } catch (error) {
    console.error('Failed to fetch ClickUp task:', error);
    throw error; // Rethrow to handle in UI
  }
}
