#!/usr/bin/env python3
"""
Database initialization script for the blog application.
Run this script to create or reset the database.
"""

from app import app, db, Post
from datetime import datetime

def init_database():
    """Initialize the database and create tables."""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✓ Database tables created successfully!")
        
        # Check if we should add sample data
        if Post.query.count() == 0:
            print("\n→ Adding sample blog posts...")
            sample_posts = [
                Post(
                    title="Welcome to My Blog!",
                    content="This is the first post on my new blog. I'm excited to share my thoughts and ideas with you. Stay tuned for more content!",
                    author="Admin",
                    created_at=datetime.utcnow()
                ),
                Post(
                    title="Getting Started with Flask",
                    content="Flask is a lightweight web framework for Python. It's perfect for building small to medium web applications. In this post, I'll share some tips for getting started with Flask development.",
                    author="Developer",
                    created_at=datetime.utcnow()
                ),
                Post(
                    title="Deploying to AWS EC2",
                    content="AWS EC2 provides scalable computing capacity in the cloud. In this guide, I'll walk through the steps to deploy a Flask application on an EC2 instance, including setting up Nginx and securing your application.",
                    author="DevOps Engineer",
                    created_at=datetime.utcnow()
                )
            ]
            
            for post in sample_posts:
                db.session.add(post)
            
            db.session.commit()
            print(f"✓ Added {len(sample_posts)} sample posts!")
        else:
            print(f"\n→ Database already contains {Post.query.count()} posts.")
        
        print("\n✅ Database initialization complete!")

if __name__ == '__main__':
    init_database()
