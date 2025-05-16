from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# Setup database
def get_db():
    conn = sqlite3.connect('books.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL
        )
    ''')
    return conn

# Routes
@app.route('/')
def index():
    conn = get_db()
    books = conn.execute('SELECT * FROM books').fetchall()
    conn.close()
    return render_template('index.html', books=books)

@app.route('/add', methods=['POST'])
def add():
    title = request.form['title']
    author = request.form['author']
    conn = get_db()
    conn.execute('INSERT INTO books (title, author) VALUES (?, ?)', (title, author))
    conn.commit()
    conn.close()
    return redirect('/')

@app.route('/delete/<int:id>', methods=['POST'])
def delete(id):
    conn = get_db()
    conn.execute('DELETE FROM books WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)