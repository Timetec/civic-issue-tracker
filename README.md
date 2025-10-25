# Civic Issue Tracker

![Civic Issue Tracker Hero Image](https://placehold.co/1200x630/6366f1/ffffff/png?text=Civic%20Issue%20Tracker)

**A modern, AI-powered web application that allows citizens to report, track, and view resolutions of civic issues in their neighborhood.**

This project was built to address the common challenge of inefficient and opaque civic issue reporting. By leveraging modern web technologies and the power of generative AI, this platform streamlines the process from submission to resolution, fostering transparency and community engagement.

---

## ✨ Key Features

### For Citizens
*   **AI-Powered Reporting**: Describe an issue, and our **Google Gemini** integration automatically suggests a concise title and categorizes it (e.g., Pothole, Graffiti, Streetlight).
*   **Photo Uploads**: Attach a photo of the issue for clear visual context.
*   **Interactive Map Location**: Pinpoint the exact location of the issue using an interactive **Google Map** with address search functionality.
*   **Real-time Status Tracking**: View a personal dashboard of all your reported issues and track their status from `Pending` to `Resolved`.
*   **Commenting & Interaction**: Communicate with admins or workers by adding comments to your issue reports.
*   **Confirm Resolution & Rate Service**: Once work is marked as complete, citizens can confirm the resolution and provide a 1-5 star rating, creating a feedback loop.

### For Admins & Workers
*   **Role-Based Access Control**: A sophisticated system with four distinct user roles: `Citizen`, `Worker`, `Admin`, and `Service`.
*   **Admin Dashboard**: A comprehensive view of all reported issues. Admins can update issue statuses, manage assignments, and oversee the entire system.
*   **Worker Dashboard**: Workers see a personalized view of only the issues assigned to them, helping them focus on their tasks.
*   **Automated Issue Assignment**: New issues are automatically assigned to the nearest available worker based on their registered location.
*   **User Management**: Admins can create new users (Workers, Service), manage user roles, and set worker locations directly on a map.

### Platform Features
*   **Public Transparency Dashboard**: The landing page showcases recently resolved issues, providing transparency to the public on the platform's effectiveness.
*   **Secure Authentication**: A complete login and registration system.
*   **Fully Responsive Design**: A clean, modern UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.
*   **Backend Abstraction Layer**: The frontend is architected to seamlessly switch between a local `localStorage` mock backend and a live remote backend by setting a single environment variable.

---

## 🛠️ Technology Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Build Tool**: Vite
*   **Generative AI**: Google Gemini API (`gemini-2.5-flash`) for AI-powered issue categorization and title generation.
*   **Maps & Geolocation**: Google Maps Platform
    *   **Maps JavaScript API**: For interactive map modals and static map previews.
    *   **Geocoding API**: For converting search queries into coordinates.
*   **Backend Simulation**: Browser `localStorage` to mock a persistent database for users and issues.

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (which includes npm) installed on your machine.
*   A modern web browser (Chrome, Firefox, Safari, Edge).

### Installation & Setup

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/civic-issue-tracker.git
    cd civic-issue-tracker
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Configure API Keys & Environment**
    Create a `.env` file in the root of the project to store your configuration.

    *   Create the file:
        ```sh
        touch .env
        ```
    *   Add the following content to your new `.env` file, replacing the placeholders with your actual keys. **Only include the variables you need for your setup.**

        ```env
        # --- REQUIRED FOR MOCK/LOCAL DEVELOPMENT ---
        # Used for the client-side Gemini calls in the mock API.
        VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        
        # --- REQUIRED FOR BOTH MODES ---
        # Used for Google Maps integration.
        VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

        # --- OPTIONAL: FOR CONNECTING TO A REAL BACKEND ---
        # If this URL is present, the app will make live API calls instead of using the mock.
        VITE_API_BASE_URL=http://127.0.0.1:5000 
        ```

    *   **To get your keys:**
        *   **Google Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
        *   **Google Maps Platform API Key**:
            1.  Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
            2.  Enable the following three (3) APIs for your project:
                *   **Maps JavaScript API**
                *   **Geocoding API**
                *   **Maps Static API**
            3.  Create a new API Key under "Credentials".
            4.  **Important**: For security, restrict your API key to your development and production domains.

4.  **Run the Application**
    Start the local development server:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy). By default, it will run using the mock `localStorage` backend.

---

## 🔌 Connecting to a Real Backend

This application is designed to connect to any backend that adheres to the defined API contract below. To switch from the mock `localStorage` mode to a live backend:

1.  **Set the Environment Variable**: Add `VITE_API_BASE_URL` to your `.env` file and set it to the URL of your running backend server (e.g., `http://localhost:5000` for a local Flask server, or your deployed API URL).
2.  **Restart the Development Server**: Stop and restart `npm run dev` for the new environment variable to be loaded.
3.  **Secure Gemini API Key**: When using a real backend, the `VITE_GEMINI_API_KEY` is no longer needed on the frontend. The backend server should handle all calls to the Gemini API. You should move the API key to your backend server's environment variables for security.

### API Contract for Backend Implementation

Your backend server (e.g., Python/Flask) must implement the following RESTful endpoints. Authentication is handled via Bearer Tokens (JWT).

#### Authentication (`/api/auth`)
*   `POST /api/auth/register`
    *   **Body**: `{ email, password, firstName, lastName, mobileNumber }`
    *   **Response**: `{ token: "jwt_token", user: { ...userObject } }`
*   `POST /api/auth/login`
    *   **Body**: `{ email, password }`
    *   **Response**: `{ token: "jwt_token", user: { ...userObject } }`

#### Users (`/api/users`)
*   `GET /api/users` (Admin only)
    *   **Response**: `[ { ...userObject }, ... ]`
*   `POST /api/users` (Admin only)
    *   **Body**: `{ email, password, firstName, lastName, mobileNumber, role, location? }`
    *   **Response**: `{ ...userObject }`
*   `GET /api/users/me` (Authenticated users)
    *   **Response**: `{ ...userObject }`
*   `PUT /api/users/me` (Authenticated users)
    *   **Body**: `{ firstName, lastName, mobileNumber }`
    *   **Response**: `{ ...userObject }`
*   `PUT /api/users/me/password` (Authenticated users)
    *   **Body**: `{ oldPassword, newPassword }`
    *   **Response**: `200 OK`
*   `PUT /api/users/me/location` (Authenticated users, mainly for Workers)
    *   **Body**: `{ lat, lng }`
    *   **Response**: `{ ...userObject }`

#### Issues (`/api/issues`)
*   `GET /api/issues` (Admin only)
    *   **Response**: `[ { ...issueObject }, ... ]`
*   `GET /api/issues/reported` (Citizen only)
    *   Returns issues reported by the authenticated citizen.
    *   **Response**: `[ { ...issueObject }, ... ]`
*   `GET /api/issues/assigned` (Worker only)
    *   Returns issues assigned to the authenticated worker.
    *   **Response**: `[ { ...issueObject }, ... ]`
*   `GET /api/issues/user/:identifier` (Service role only)
    *   Returns issues for a specific user by email or mobile.
    *   **Response**: `[ { ...issueObject }, ... ]`
*   `GET /api/issues/:id` (Authenticated users, with role-based access checks)
    *   **Response**: `{ ...issueObject }`
*   `POST /api/issues` (Authenticated users)
    *   **Body**: `FormData` containing `description` (string), `location` (JSON string `{"lat": number, "lng": number}`), and `photos` (file array).
    *   **Backend Logic**: The backend should receive this, call the Gemini API for categorization, find the nearest worker, and then create the issue in the database.
    *   **Response**: `{ ...issueObject }`
*   `POST /api/issues/:id/comments` (Authorized users)
    *   **Body**: `{ text: "comment_text" }`
    *   **Response**: `{ ...issueObject }`
*   `PUT /api/issues/:id/status` (Admin/Worker only)
    *   **Body**: `{ status: "NewStatus" }`
    *   **Response**: `{ ...issueObject }`
*   `PUT /api/issues/:id/assign` (Admin only)
    *   **Body**: `{ workerEmail: "worker@test.com" }`
    *   **Response**: `{ ...issueObject }`
*   `PUT /api/issues/:id/resolve` (Citizen who reported it only)
    *   **Body**: `{ rating: 5 }`
    *   **Response**: `{ ...issueObject }`

---

## Deployment

This project is configured for easy deployment on platforms like Vercel or Netlify.

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Import the repository into your hosting provider.
3. Configure the environment variables (`VITE_GOOGLE_MAPS_API_KEY` and optionally `VITE_API_BASE_URL` if connecting to a deployed backend) in your provider's settings.
4. The build command is `npm run build` and the output directory is `dist`. This is usually detected automatically.
5. Deploy!
---

## 🔮 Future Improvements

This project provides a strong foundation. Here are some potential next steps:

*   **Chatbot for Status Updates**: Implement the hackathon's bonus idea by adding a Gemini-powered chatbot where users can ask, "What's the status of my complaint?"
*   **Notifications**: Integrate push or email notifications for real-time status updates.
*   **Analytics Dashboard**: Provide admins with analytics on issue types, resolution times, and worker performance.
