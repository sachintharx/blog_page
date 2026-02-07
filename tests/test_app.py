"""
Unit tests for the blog application.
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db, Post
from datetime import datetime


@pytest.fixture
def client():
    """Create a test client for the app."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()


@pytest.fixture
def sample_post():
    """Create a sample post for testing."""
    return Post(
        title="Test Post",
        content="This is test content.",
        author="Test Author"
    )


def test_index_page(client):
    """Test the index page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome to My Blog' in response.data


def test_about_page(client):
    """Test the about page loads successfully."""
    response = client.get('/about')
    assert response.status_code == 200
    assert b'About This Blog' in response.data


def test_create_post_page(client):
    """Test the create post page loads successfully."""
    response = client.get('/create')
    assert response.status_code == 200
    assert b'Create New Post' in response.data


def test_create_post(client):
    """Test creating a new post."""
    response = client.post('/create', data={
        'title': 'New Test Post',
        'content': 'This is new test content.',
        'author': 'Test Author'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    assert b'Post created successfully!' in response.data


def test_create_post_missing_fields(client):
    """Test creating a post with missing fields."""
    response = client.post('/create', data={
        'title': 'Incomplete Post',
        'content': ''
    }, follow_redirects=True)
    
    assert response.status_code == 200
    assert b'All fields are required!' in response.data


def test_view_post(client, sample_post):
    """Test viewing a single post."""
    with app.app_context():
        db.session.add(sample_post)
        db.session.commit()
        post_id = sample_post.id
    
    response = client.get(f'/post/{post_id}')
    assert response.status_code == 200
    assert b'Test Post' in response.data
    assert b'Test Author' in response.data


def test_edit_post(client, sample_post):
    """Test editing a post."""
    with app.app_context():
        db.session.add(sample_post)
        db.session.commit()
        post_id = sample_post.id
    
    response = client.post(f'/edit/{post_id}', data={
        'title': 'Updated Test Post',
        'content': 'Updated content.',
        'author': 'Updated Author'
    }, follow_redirects=True)
    
    assert response.status_code == 200
    assert b'Post updated successfully!' in response.data


def test_delete_post(client, sample_post):
    """Test deleting a post."""
    with app.app_context():
        db.session.add(sample_post)
        db.session.commit()
        post_id = sample_post.id
    
    response = client.post(f'/delete/{post_id}', follow_redirects=True)
    assert response.status_code == 200
    assert b'Post deleted successfully!' in response.data


def test_post_model():
    """Test Post model creation."""
    post = Post(
        title="Model Test",
        content="Testing the model",
        author="Tester"
    )
    
    assert post.title == "Model Test"
    assert post.content == "Testing the model"
    assert post.author == "Tester"
    assert post.__repr__() == '<Post Model Test>'


def test_404_page(client):
    """Test 404 error for non-existent post."""
    response = client.get('/post/99999')
    assert response.status_code == 404
