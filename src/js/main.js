// Client-side CRUD for blog posts using localStorage
const STORAGE_KEY = 'blog_posts_v1';

const defaultPosts = [
	{
		id: crypto.randomUUID(),
		title: 'Getting started with my blog',
		date: '2026-02-08',
		content: 'Welcome to my new blog — I will share projects, notes, and tutorials here. Stay tuned for more updates!'
	},
	{
		id: crypto.randomUUID(),
		title: 'Building a simple SPA',
		date: '2026-02-07',
		content: 'A lightweight SPA can be built with plain HTML, CSS, and JavaScript. Ship static when you can for speed.'
	}
];

let posts = [];

function loadPosts() {
	const stored = localStorage.getItem(STORAGE_KEY);
	posts = stored ? JSON.parse(stored) : defaultPosts;
}

function savePosts() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function setStatus(text) {
	const el = document.getElementById('status');
	if (el) el.textContent = text;
}

function resetForm() {
	document.getElementById('postId').value = '';
	document.getElementById('title').value = '';
	document.getElementById('date').value = '';
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

function handleSubmit(e) {
	e.preventDefault();
	const idField = document.getElementById('postId');
	const title = document.getElementById('title').value.trim();
	const date = document.getElementById('date').value;
	const content = document.getElementById('content').value.trim();
	if (!title || !date || !content) return;

	if (idField.value) {
		const idx = posts.findIndex(p => p.id === idField.value);
		if (idx !== -1) {
			posts[idx] = { ...posts[idx], title, date, content };
			setStatus('Post updated');
		}
	} else {
		posts.unshift({ id: crypto.randomUUID(), title, date, content });
		setStatus('Post created');
	}

	savePosts();
	renderPosts();
	resetForm();
}

function handleCancel() {
	resetForm();
}

function handleListClick(e) {
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
		posts = posts.filter(p => p.id !== id);
		savePosts();
		renderPosts();
		resetForm();
		setStatus('Post deleted');
	}
}

function init() {
	loadPosts();
	renderPosts();

	document.getElementById('postForm').addEventListener('submit', handleSubmit);
	document.getElementById('cancelEdit').addEventListener('click', handleCancel);
	document.getElementById('posts').addEventListener('click', handleListClick);
}

document.addEventListener('DOMContentLoaded', init);