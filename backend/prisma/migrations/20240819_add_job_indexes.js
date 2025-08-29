// This migration adds indexes to optimize job search queries
module.exports = {
  async up(db) {
    // Create compound index for the main job search query
    await db.collection('Job').createIndex(
      { 
        status: 1, 
        title: 'text',
        location: 1,
        type: 1,
        postedDate: -1 
      },
      {
        name: 'job_search_index',
        weights: {
          title: 2,  // Give more weight to title matches
          location: 1
        },
        default_language: 'none',
        language_override: 'none'
      }
    );
  },

  async down(db) {
    await db.collection('Job').dropIndex('job_search_index');
  }
};
