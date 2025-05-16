// DOM Elements
const bookList = document.getElementById('book-list');
const addForm = document.getElementById('add-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const toast = document.getElementById('toast');

// Fetch all books
async function fetchBooks(sortBy = 'title') {
    try {
        const response = await fetch(`/api/books`);
        let books = await response.json();
        
        // Sort books
        books.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
        
        renderBooks(books);
    } catch (error) {
        showToast('Error loading books', 'error');
    }
}

// Render books to the page
function renderBooks(books) {
    bookList.innerHTML = '';
    
    if (books.length === 0) {
        bookList.innerHTML = '<p class="no-books">No books found. Add some!</p>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            ${book.cover_url ? 
                `<img src="${book.cover_url}" alt="${book.title}" class="book-cover">` : 
                `<div class="book-cover placeholder"><i class="fas fa-book"></i></div>`
            }
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                ${book.year ? `<p class="book-year">Published: ${book.year}</p>` : ''}
            </div>
            <button class="delete-btn" data-id="${book.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        bookList.appendChild(bookCard);
    });
}

// Add new book
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const coverUrl = document.getElementById('cover-url').value;
    
    if (!title || !author) {
        showToast('Title and author are required!', 'warning');
        return;
    }
    
    try {
        await fetch('/api/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                author,
                year: year || null,
                cover_url: coverUrl || null
            })
        });
        
        showToast('Book added successfully!', 'success');
        addForm.reset();
        fetchBooks(sortSelect.value);
    } catch (error) {
        showToast('Error adding book', 'error');
    }
});

// Search books
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length === 0) {
        fetchBooks(sortSelect.value);
        return;
    }
    
    try {
        const response = await fetch(`/api/search?q=${query}`);
        const results = await response.json();
        renderBooks(results);
    } catch (error) {
        showToast('Error searching', 'error');
    }
});

// Sort books
sortSelect.addEventListener('change', () => {
    fetchBooks(sortSelect.value);
});

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = 'toast show';
    toast.style.background = 
        type === 'success' ? '#4caf50' :
        type === 'error' ? '#f44336' :
        type === 'warning' ? '#ff9800' : '#212529';
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

let bookToDelete = null; // Track the book to delete

// Open modal on delete button click
document.addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) {
        const deleteBtn = e.target.closest('.delete-btn');
        bookToDelete = deleteBtn.dataset.id;

        const modal = document.getElementById('delete-modal');
        modal.classList.add('show');
    }
});

// Handle modal actions
document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (bookToDelete) {
        try {
            await fetch(`/api/delete/${bookToDelete}`, { method: 'POST' });
            showToast('Book deleted successfully!', 'success');
            fetchBooks(sortSelect.value);
        } catch (error) {
            showToast('Error deleting book', 'error');
        }
    }

    closeModal();
});

document.getElementById('cancel-delete').addEventListener('click', () => {
    bookToDelete = null; // Reset the book to delete
    closeModal();
});

function closeModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('show');
}