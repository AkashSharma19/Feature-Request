/**
 * ClickUp Status Mapping
 * Maps ClickUp status names (case-insensitive) to our local application statuses.
 * Adjust these based on your ClickUp status names.
 */
/**
 * Fetch task status from ClickUp API
 * @param {string} taskId - The ClickUp Task ID
 * @param {string} apiKey - Your ClickUp API Key
 * @param {string} teamId - Your ClickUp Team ID
 * @param {Object} statusMap - Dynamic status mapping from settings
 * @returns {Promise<{ status: string, name: string } | null>}
 */
export async function fetchClickUpTask(taskId, apiKey, teamId = null, statusMap = {}) {
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
    
    // Find which local status matches this rawStatus based on the provided map
    let mappedStatus = null;
    
    for (const [localStatus, clickupStatuses] of Object.entries(statusMap)) {
      // clickupStatuses is expected to be a string like "to do, in progress" or an array
      const targets = Array.isArray(clickupStatuses) 
        ? clickupStatuses 
        : clickupStatuses.split(',').map(s => s.trim().toLowerCase());
        
      if (targets.includes(rawStatus)) {
        mappedStatus = localStatus;
        break;
      }
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
