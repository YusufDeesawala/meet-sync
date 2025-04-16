
# 📝 Backend Service for Notes App (MongoDB + Express)

This is the backend API service for managing notes. It connects to a MongoDB database using Mongoose and provides a simple API layer built with Express.js.

---

## ⚙️ Getting Started

Follow the steps below to set up and run the backend locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2️⃣ Set Up Environment Variables

Create a `.env` file in the root of the project. You can use `.env.example` as a reference:

```bash
cp .env.example .env
```

Then, update the `.env` file with your MongoDB URI:

```env
MONGO_URL=mongodb://localhost:27017/mydb
PORT=5000
```

---

### 3️⃣ Install Dependencies

Make sure you have Node.js and npm installed, then run:

```bash
npm install
```

---

### 4️⃣ Run the Server

Start the backend server using **nodemon** for auto-reloading:

```bash
npx nodemon index.js
```

Or if you have nodemon globally:

```bash
nodemon index.js
```

You should see a message like:

```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

---

## 📦 Project Structure

```bash
.
├── index.js           # Entry point
├── .env               # Your environment variables
├── .env.example       # Example .env file
├── package.json
└── README.md
```

---


### 📬 API Endpoints

All routes are `POST` requests and are prefixed with:

```
/api/auth     → for user authentication  
/api/notes    → for managing notes
```

---

#### 🔐 Authentication Routes (`/api/auth`)

| Endpoint         | Description             | Body Parameters                         |
|------------------|--------------------------|------------------------------------------|
| `POST /register` | Register a new user      | `name`, `email`, `password`              |
| `POST /login`    | Login existing user      | `email`, `password`                      |

---

#### 🗒️ Notes Routes (`/api/notes`)

> ⚠️ All notes routes require an `auth-token` in headers.

| Endpoint                   | Description             | Body Parameters                         |
|----------------------------|--------------------------|------------------------------------------|
| `POST /addnote`            | Add a new note           | `title`, `description`, `tag` (optional) |
| `POST /fetchnotes`         | Get all notes for user   | _No body params_                         |
| `POST /deletenote/:id`     | Delete a note by ID      | _No body params_                         |
| `POST /updatenote/:id`     | Update a note by ID      | Any of `title`, `description`, `tag`     |

---

### 🛠 Example Headers

```http
auth-token: your_jwt_token_here
Content-Type: application/json
```

---

## 🧠 Tech Stack

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **dotenv**

---

## 🤝 Contributing

PRs are welcome! Just make sure you follow best practices and keep it clean.

---

## 🛡️ License

MIT — free to use and modify.

```

---

