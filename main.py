from flask import Flask, render_template, request, redirect, url_for, session, flash
import requests

app = Flask(__name__)
app.secret_key = 'supersecretkey'

BASE_URL = 'http://localhost:5000'
auth_token = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        payload = {
            "name": request.form['name'],
            "email": request.form['email'],
            "password": request.form['password']
        }
        res = requests.post(f"{BASE_URL}/api/auth/", json=payload)
        if res.status_code == 200:
            flash("Registration successful!", "success")
            return redirect(url_for('login'))
        flash("Registration failed", "danger")
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    global auth_token
    if request.method == 'POST':
        payload = {
            "email": request.form['email'],
            "password": request.form['password']
        }
        res = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        if res.status_code == 200:
            auth_token = res.json().get("authToken")
            session['token'] = auth_token
            flash("Login successful!", "success")
            return redirect(url_for('add_note'))
        flash("Login failed!", "danger")
    return render_template('login.html')

#To manually add notes and fetch it
"""@app.route('/addnote', methods=['GET', 'POST'])
def add_note():
    if 'token' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        payload = {
            "title": request.form['title'],
            "description": request.form['description'],
            "tag": request.form.get('tag', "General")
        }
        headers = {
            "auth-token": session['token']
        }
        res = requests.post(f"{BASE_URL}/api/notes/addnote", json=payload, headers=headers)
        if res.status_code == 200:
            flash("Note added!", "success")
            return redirect(url_for('get_notes'))
        flash("Error adding note", "danger")
    return render_template('addnote.html')

@app.route('/notes')
def get_notes():
    if 'token' not in session:
        return redirect(url_for('login'))
    headers = {
        "auth-token": session['token']
    }
    res = requests.get(f"{BASE_URL}/api/notes/fetchnotes", headers=headers)
    notes = res.json() if res.status_code == 200 else []
    return render_template('notes.html', notes=notes)
"""
if __name__ == '__main__':
    app.run(debug=True , port= 8080)
