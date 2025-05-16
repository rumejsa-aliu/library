from flask import Flask, render_template, request, redirect, jsonify
import sqlite3

app = Flask(__name__)

# Database setup
def get_db():
    conn = sqlite3.connect('books.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        # Drop the table if it exists to avoid schema conflicts
        db.execute('DROP TABLE IF EXISTS books')
        
        # Create the table with the correct schema
        db.execute('''
            CREATE TABLE books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                year INTEGER,
                cover_url TEXT
            )
        ''')
        
        # Add sample books
        db.executemany(
            'INSERT INTO books (title, author, year, cover_url) VALUES (?, ?, ?, ?)',
            [
                ('The Hobbit', 'J.R.R. Tolkien', 1937, 'https://covers.openlibrary.org/b/id/6979865-M.jpg'),
                ('Dune', 'Frank Herbert', 1965, 'https://covers.openlibrary.org/b/id/8264441-M.jpg')
            ]
        )

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/books', methods=['GET'])
def get_books():
    with get_db() as db:
        books = db.execute('SELECT * FROM books ORDER BY title').fetchall()
    return jsonify([dict(book) for book in books])

@app.route('/api/add', methods=['POST'])
def add_book():
    data = request.json
    with get_db() as db:
        db.execute(
            'INSERT INTO books (title, author, year, cover_url) VALUES (?, ?, ?, ?)',
            (data['title'], data['author'], data.get('year'), data.get('cover_url'))
        )
    return jsonify({'status': 'success'})

@app.route('/api/delete/<int:id>', methods=['POST'])
def delete_book(id):
    with get_db() as db:
        db.execute('DELETE FROM books WHERE id = ?', (id,))
    return jsonify({'status': 'success'})

@app.route('/api/search')
def search():
    query = request.args.get('q', '').lower()
    with get_db() as db:
        books = db.execute('SELECT * FROM books').fetchall()
    results = [dict(book) for book in books if query in book['title'].lower() or query in book['author'].lower()]
    return jsonify(results)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)