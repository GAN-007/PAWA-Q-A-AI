from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

class Database:
    _instance = None
    client: Optional[AsyncIOMotorClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def initialize(self):
        """Initialize MongoDB connection"""
        self.client = AsyncIOMotorClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
    
    @property
    def db(self):
        if self.client is None:
            raise Exception("Database not initialized")
        return self.client.neuralnexus

# Create database instance
db = Database()