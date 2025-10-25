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
*   **Mock Backend**: Utilizes browser `localStorage` to provide a fully functional, persistent experience without needing a live backend—perfect for a hackathon.

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

3.  **Configure API Keys**
    This project requires two API keys from Google. You'll need to create a `.env` file in the root of the project to store them.

    *   Create the file:
        ```sh
        touch .env
        ```
    *   Add the following content to your new `.env` file, replacing the placeholders with your actual keys:
        ```env
        VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
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
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Deployment

This project is configured for easy deployment on platforms like Vercel or Netlify.

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Import the repository into your hosting provider.
3. Configure the same environment variables (`VITE_GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY`) in your provider's settings.
4. The build command is `npm run build` and the output directory is `dist`. This is usually detected automatically.
5. Deploy!

---

## 🔮 Future Improvements

This project provides a strong foundation. Here are some potential next steps:

*   **Chatbot for Status Updates**: Implement the hackathon's bonus idea by adding a Gemini-powered chatbot where users can ask, "What's the status of my complaint?"
*   **Notifications**: Integrate push or email notifications for real-time status updates.
*   **Full Backend Implementation**: Replace the `localStorage` mock API with a real backend service (e.g., Node.js/Express, Firebase, or Supabase) for a production-ready application.
*   **Analytics Dashboard**: Provide admins with analytics on issue types, resolution times, and worker performance.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.