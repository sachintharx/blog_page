// Simple client-side post renderer
const posts = [
	{
		id: 1,
		title: "Getting started with my blog",
		date: "2026-02-08",
		excerpt: "Welcome to my new blog — I'll write about web projects, tips and tutorials.",
		content: "<p>This is the first post on my blog. I will share projects, notes and tutorials here.</p>"
	},
	{
		id: 2,
		title: "Building a simple SPA",
		date: "2026-02-07",
		excerpt: "A small guide to creating a single-page application using vanilla HTML/CSS/JS.",
		content: "<p>SPAs can be made lightweight. Use static generation when possible for simple sites.</p>"
	}
];

function renderPosts() {
	const container = document.getElementById('posts');
	if (!container) return;
	container.innerHTML = '';
	posts.forEach(post => {
		const el = document.createElement('article');
		el.className = 'post';
		el.innerHTML = `
			<h2>${post.title}</h2>
			<div class="meta">${post.date}</div>
			<p>${post.excerpt}</p>
			<div class="readmore"><a href="#" data-id="${post.id}">Read more</a></div>
			<div class="full" style="display:none">${post.content}</div>
		`;
		container.appendChild(el);
	});

	container.addEventListener('click', (e) => {
		const a = e.target.closest('a[data-id]');
		if (!a) return;
		e.preventDefault();
		const id = Number(a.getAttribute('data-id'));
		const article = a.closest('.post');
		if (!article) return;
		const full = article.querySelector('.full');
		if (full.style.display === 'none') full.style.display = 'block';
		else full.style.display = 'none';
	});
}

document.addEventListener('DOMContentLoaded', renderPosts);