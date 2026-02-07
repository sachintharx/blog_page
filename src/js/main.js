// Client-side CRUD using backend API with local fallback cache
const API = '/api/posts';
const STORAGE_KEY = 'blog_posts_v1_cache';
let posts = [];

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

function cachePosts(list) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadCache() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

function setStatus(text) {
	const el = document.getElementById('status');
	if (el) el.textContent = text;
}

function resetForm() {
	document.getElementById('postId').value = '';
	document.getElementById('title').value = '';
	document.getElementById('date').value = todayISO();
	document.getElementById('content').value = '';
	setStatus('Ready');
}

function renderPosts() {
	const container = document.getElementById('posts');
	if (!container) return;
	container.innerHTML = '';
	if (!posts.length) {
		container.innerHTML = '<p class="pill">No posts yet. Add one!</p>';
		return;
	}

	posts
		.slice()
		.sort((a, b) => (a.date < b.date ? 1 : -1))
		.forEach(post => {
			const el = document.createElement('article');
			el.className = 'post';
			const excerpt = post.content.length > 180 ? `${post.content.slice(0, 180)}…` : post.content;
			el.innerHTML = `
				<h2>${post.title}</h2>
				<div class="meta">${post.date}</div>
				<p>${excerpt}</p>
				<div class="actions">
					<button class="btn primary" data-action="edit" data-id="${post.id}">Edit</button>
					<button class="btn ghost" data-action="delete" data-id="${post.id}">Delete</button>
				</div>
			`;
			container.appendChild(el);
		});
}

async function fetchPosts() {
	try {
		const res = await fetch(API);
		if (!res.ok) throw new Error('API error');
		const data = await res.json();
		posts = data.map(p => ({ ...p, id: p._id || p.id }));
		cachePosts(posts);
		setStatus('Synced');
	} catch (err) {
		posts = loadCache();
		setStatus('Offline (using cache)');
	}
	renderPosts();
}

async function createPost(payload) {
	const res = await fetch(API, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) throw new Error('Create failed');
	return res.json();
}

async function updatePost(id, payload) {
	const res = await fetch(`${API}/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) throw new Error('Update failed');
	return res.json();
}

async function deletePost(id) {
	const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error('Delete failed');
}

async function handleSubmit(e) {
	e.preventDefault();
	const idField = document.getElementById('postId');
	const title = document.getElementById('title').value.trim();
	const date = document.getElementById('date').value || todayISO();
	const content = document.getElementById('content').value.trim();
	if (!title || !date || !content) return;

	try {
		if (idField.value) {
			await updatePost(idField.value, { title, date, content });
			setStatus('Post updated');
		} else {
			await createPost({ title, date, content });
			setStatus('Post created');
		}
		await fetchPosts();
		resetForm();
	} catch (err) {
		setStatus('Save failed');
	}
}

function handleCancel() {
	resetForm();
}

async function handleListClick(e) {
	const btn = e.target.closest('button[data-action]');
	if (!btn) return;
	const id = btn.getAttribute('data-id');
	const action = btn.getAttribute('data-action');
	if (action === 'edit') {
		const post = posts.find(p => p.id === id);
		if (!post) return;
		document.getElementById('postId').value = post.id;
		document.getElementById('title').value = post.title;
		document.getElementById('date').value = post.date;
		document.getElementById('content').value = post.content;
		setStatus('Editing…');
		document.getElementById('title').focus();
	}
	if (action === 'delete') {
		const confirmed = confirm('Delete this post?');
		if (!confirmed) return;
		try {
			await deletePost(id);
			await fetchPosts();
			resetForm();
			setStatus('Post deleted');
		} catch (err) {
			setStatus('Delete failed');
		}
	}
}

function init() {
	resetForm();
	fetchPosts();
	document.getElementById('postForm').addEventListener('submit', handleSubmit);
	document.getElementById('cancelEdit').addEventListener('click', handleCancel);
	document.getElementById('posts').addEventListener('click', handleListClick);
}

document.addEventListener('DOMContentLoaded', init);