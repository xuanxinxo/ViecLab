const { PrismaClient } = require('@prisma/client');

async function createIndexes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating database indexes...');
    
    // Create single field indexes
    await prisma.$runCommandRaw({
      createIndexes: 'Job',
      indexes: [
        {
          key: { status: 1 },
          name: 'Job_status_idx'
        },
        {
          key: { title: 1 },
          name: 'Job_title_idx',
          collation: { locale: 'en', strength: 2 } // Case insensitive
        },
        {
          key: { location: 1 },
          name: 'Job_location_idx',
          collation: { locale: 'en', strength: 2 } // Case insensitive
        },
        {
          key: { type: 1 },
          name: 'Job_type_idx'
        },
        {
          key: { postedDate: -1 },
          name: 'Job_postedDate_idx'
        }
      ]
    });

    // Create compound index for search
    await prisma.$runCommandRaw({
      createIndexes: 'Job',
      indexes: [
        {
          key: {
            status: 1,
            title: 1,
            location: 1,
            type: 1
          },
          name: 'Job_search_idx',
          collation: { locale: 'en', strength: 2 } // Case insensitive for text fields
        }
      ]
    });

    console.log('✅ Database indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createIndexes();
