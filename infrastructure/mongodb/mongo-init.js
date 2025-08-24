// This script will be executed automatically by the MongoDB container on its first run.

// Switch to the target database specified in your .env file (default is 'irep_docs')
db = db.getSiblingDB('irep_docs');

print("Starting MongoDB initialization...");

// Create collections. While MongoDB creates them on first insert,
// explicitly creating them is good practice for clarity.
db.createCollection('audit_events');
db.createCollection('property_tours');
db.createCollection('search_embeddings');
db.createCollection('notifications');

print("Collections created.");

// Create Indexes for performance
print("Creating indexes for 'audit_events'...");
db.audit_events.createIndex({ "tenantId": 1, "timestamp": -1 });
db.audit_events.createIndex({ "action": 1 });
db.audit_events.createIndex({ "entity.type": 1, "entity.id": 1 });

print("Creating indexes for 'property_tours'...");
db.property_tours.createIndex({ "tenantId": 1, "propertyId": 1 });
db.property_tours.createIndex({ "tourType": 1 });

print("Creating indexes for 'search_embeddings'...");
db.search_embeddings.createIndex({ "tenantId": 1, "entityType": 1 });
db.search_embeddings.createIndex({ "entityId": 1 });

print("Creating indexes for 'notifications'...");
db.notifications.createIndex({ "tenantId": 1, "userId": 1, "createdAt": -1 });
db.notifications.createIndex({ "status": 1, "scheduledAt": 1 });

print("Indexes created.");

// Insert Seed Data
print("Inserting seed data for 'property_tours'...");
db.property_tours.insertMany([
  {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "propertyId": "550e8400-e29b-41d4-a716-446655440005", // Corresponds to the 'Downtown Condo' in init.sql
    "tourType": "3d",
    "scenes": [
      {
        "id": "scene_1",
        "name": "Living Room",
        "panoramaUrl": "https://cdn.example.com/tours/scene1.jpg",
        "hotspots": [
          {
            "id": "hotspot_1",
            "type": "navigation",
            "position": { "x": 0.5, "y": 0.3 },
            "targetScene": "scene_2",
            "title": "Go to Kitchen"
          }
        ]
      }
    ],
    "settings": {
      "autoRotate": true,
      "showNavigation": true
    },
    "createdAt": new ISODate(),
    "updatedAt": new ISODate()
  }
]);

print("Seed data inserted.");
print("MongoDB initialization complete.");
