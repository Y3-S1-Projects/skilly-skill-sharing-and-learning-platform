# Skilly

Skilly is a full-stack web application designed to facilitate learning and knowledge sharing among users. It features a modern React frontend and a robust Spring Boot backend.

## Features

### Frontend (React)

-   **Learning Plan Creation:** Users can create and manage personalized learning plans.
-   **Social Feed:** A dynamic feed where users can share posts, engage in discussions, and stay updated on others' learning journeys.
-   **Profile Editing:** Users can customize their profiles, including updating personal information, adding skills, and setting preferences.
-   **Authentication:** Secure user login and registration functionality.
-   **Responsive Design:** Optimized for seamless use across various devices.

### Backend (Spring Boot)

-   **Learning Plan Management:** RESTful API endpoints for creating, updating, retrieving, and deleting learning plans.
-   **User Management:** API endpoints for user registration, login, profile management, and authentication.
-   **Post Management:** API endpoints for creating, retrieving, updating, and deleting posts.
-   **Search**: search for learning plans and users.
-   **Notifications:** Real time notifications for comments and likes.

## Technologies

### Frontend

-   **React:** A JavaScript library for building user interfaces.
-   **Vite:** A modern build tool that significantly improves the development experience.
-   **Tailwind CSS**: CSS framework.

### Backend

-   **Spring Boot:** A Java-based framework for building enterprise applications.
-   **Maven:** A build automation tool for managing project dependencies and building the application.
- **Spring Security**: Security framework.
- **Cloudinary**: For images.
- **SocketIO**: For real time notifications.

## Getting Started

### Prerequisites

-   Node.js and npm (for the frontend)
-   Java Development Kit (JDK) (for the backend)
-   Maven (for the backend)
- A Database(mongodb)

### Installation

1.  **Clone the repository:**
```
bash
    git clone <repository-url>
    cd skilly
    
```
2.  **Backend Setup:**

    -   Navigate to the backend directory:
```
bash
        cd backend/skilly
        
```
-  Update the configuration in application.properties
```
        spring.datasource.url=jdbc:postgresql://<host>:<port>/<database>
        spring.datasource.username=<user>
        spring.datasource.password=<password>
        
```
-  Build and run the Spring Boot application:
```
bash
        mvn clean install
        mvn spring-boot:run
        
```
3. **Frontend Setup:**

    -   Navigate to the frontend directory:
```
bash
        cd frontend
        
```
-   Install the dependencies:
```
bash
        npm install
        
```
-   Start the development server:
```
bash
        npm run dev
        
```
-    Open your web browser and visit `http://localhost:5173` (or the port specified by Vite).

## Directory Structure
```
skilly/
├── backend/           # Spring Boot backend
│   └── skilly/       # Backend application code
│       ├── src/
│       └── pom.xml   # Maven configuration
└── frontend/          # React frontend
    ├── public/
    ├── src/
    ├── index.html
    ├── package.json # Node package.json
    └── vite.config.js # vite configuration
```
## Contributing

Contributions are welcome! If you'd like to contribute to Skilly, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your branch to your forked repository.
5.  Submit a pull request.
