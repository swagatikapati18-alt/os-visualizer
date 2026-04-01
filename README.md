# 🖥️ OS Visualizer App

> An interactive, full-stack MERN application for visualizing Operating System concepts — built for students, optimized for placements.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Node](https://img.shields.io/badge/Node.js-18+-339933) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

---

## ✨ Features

### 🔄 Process Scheduling Visualizer
- **FCFS** — First Come First Serve
- **SJF** — Shortest Job First (Non-Preemptive)
- **SRTF** — Shortest Remaining Time First (Preemptive SJF)
- **Round Robin** — with configurable Time Quantum
- **Priority Scheduling** — Non-Preemptive
- Animated **Gantt Chart** with step-by-step playback
- Computed Waiting Time, Turnaround Time, Completion Time
- Bar chart comparison of WT vs TAT

### 🧠 Memory Management
- **FIFO** — First In First Out page replacement
- **LRU** — Least Recently Used
- **Optimal** — Optimal page replacement
- Frame-by-frame allocation table with fault/hit highlighting
- Fault rate bar and statistics

### 🔒 Deadlock Detection
- **Banker's Algorithm** — safe state detection
- Safe sequence display or deadlock identification
- **Resource Allocation Graph (RAG)** using D3.js
- Interactive allocation & max-need matrix editor
- Computed Need matrix

### 💿 Disk Scheduling
- **FCFS** — First Come First Serve
- **SSTF** — Shortest Seek Time First
- **SCAN** — Elevator algorithm
- **C-SCAN** — Circular SCAN
- Animated **head movement line chart**
- Total seek time and sequence display

### 🎨 UI/UX
- Dark/Light mode toggle
- Responsive layout with collapsible sidebar
- Animation controls (Play/Pause/Step/Speed)
- Save simulations to MongoDB
- Export results as **PDF** (with chart snapshot)
- View saved simulation history

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd os-visualizer

# Install all dependencies (root + backend + frontend)
npm install
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/os_visualizer
CLIENT_URL=http://localhost:3000
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/os_visualizer
```

### 3. Run Development Servers

```bash
# From root directory — runs both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend   # Backend on :5000
npm run dev:frontend  # Frontend on :3000
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
os-visualizer/
├── package.json                   # Root scripts (concurrently)
│
├── backend/
│   ├── server.js                  # Express entry point
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   ├── models/
│   │   └── Simulation.js          # Mongoose schema
│   ├── routes/
│   │   └── simulations.js         # REST API routes
│   └── controllers/
│       └── simulationController.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.js                 # Root component
        ├── index.js
        ├── index.css              # Global styles + Tailwind
        ├── context/
        │   └── AppContext.jsx     # Theme + active module state
        ├── utils/
        │   ├── api.js             # Axios API helper
        │   ├── schedulingAlgorithms.js  # FCFS, SJF, RR, Priority
        │   ├── memoryAlgorithms.js      # FIFO, LRU, Optimal
        │   ├── deadlockAlgorithms.js    # Banker's Algorithm + RAG
        │   ├── diskAlgorithms.js        # FCFS, SSTF, SCAN, C-SCAN
        │   └── pdfExport.js             # jsPDF export utility
        └── components/
            ├── common/
            │   ├── Sidebar.jsx          # Navigation sidebar
            │   ├── GanttChart.jsx       # Animated Gantt chart
            │   ├── AnimationControls.jsx # Play/Pause/Step controls
            │   ├── StatsCard.jsx        # Metric display card
            │   ├── SaveSimulation.jsx   # Save to DB modal
            │   └── HistoryPage.jsx      # Saved simulations view
            ├── scheduling/
            │   └── SchedulingPage.jsx   # Full scheduling module
            ├── memory/
            │   └── MemoryPage.jsx       # Memory management module
            ├── deadlock/
            │   └── DeadlockPage.jsx     # Deadlock module with RAG
            └── disk/
                └── DiskPage.jsx         # Disk scheduling module
```

---

## 🔌 REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/simulations` | Save a simulation |
| `GET` | `/simulations` | Get all simulations (optional `?type=scheduling`) |
| `GET` | `/simulations/:id` | Get simulation by ID |
| `DELETE` | `/simulations/:id` | Delete simulation |

### Save Simulation Request Body
```json
{
  "type": "scheduling",
  "algorithm": "rr",
  "name": "Round Robin TQ=2 Test",
  "inputData": { "processes": [...], "timeQuantum": 2 },
  "results": { "gantt": [...], "processes": [...] }
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Hooks, Context API |
| Styling | Tailwind CSS, Custom CSS Variables |
| Charts | Chart.js (react-chartjs-2), D3.js |
| Animation | CSS animations, D3 transitions |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| PDF Export | jsPDF, jsPDF-AutoTable |
| HTTP Client | Axios |
| Dev Tools | Nodemon, Concurrently |

---

## 📸 Modules Overview

| Module | Algorithms | Visualization |
|--------|-----------|---------------|
| Scheduling | FCFS, SJF, SRTF, RR, Priority | Gantt Chart + Bar Chart |
| Memory | FIFO, LRU, Optimal | Frame allocation table |
| Deadlock | Banker's Algorithm | Resource Allocation Graph |
| Disk | FCFS, SSTF, SCAN, C-SCAN | Head movement line chart |

---

## 🎓 Placement-Ready Features

- Clean, modern dark UI with professional typography
- Interactive step-by-step animations
- Save & export simulation results as PDF
- RESTful API with MongoDB persistence
- Component-based architecture
- Responsive design (mobile + desktop)

---

## 📄 License

MIT — Free to use for educational purposes.
