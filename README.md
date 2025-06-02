✨ PAWA Q&A AI ✨ (GitHub)


Author: George Alfred Nyamema (GitHub)

PAWA Q&A AI is an advanced, interactive system designed to provide detailed and accurate responses to travel-related queries. 🌍 This project seamlessly integrates cutting-edge technologies to deliver a robust and user-friendly experience:
OpenAI's ChatGPT for powerful natural language processing.
FastAPI for a high-performance and reliable backend.
Next.js with TailwindCSS for a sleek and intuitive frontend.
It prioritizes reliability and user experience, featuring comprehensive error handling, robust input validation, and real-time user feedback mechanisms.

🌟 Features
Backend (FastAPI):


🚀 Built with FastAPI for speed and efficiency.
✅ Includes Cross-Origin Resource Sharing (CORS) support for seamless integration.
📊 Features detailed logging for easy debugging and monitoring.
❤️ Provides health check endpoints to monitor system status.
Frontend (Next.js & TailwindCSS):


🖼️ Developed using Next.js with React for a dynamic interface.
🎨 Styled elegantly with TailwindCSS for a modern look.
⚡ Enhanced with real-time user feedback mechanisms for a responsive experience.
LLM Integration (OpenAI GPT-3.5-turbo):


🧠 Powered by OpenAI's GPT-3.5-turbo model for intelligent responses.
♻️ Incorporates retry logic for failed requests, ensuring robustness.
📝 Utilizes structured response parsing for consistent and reliable output.
Validation:


🔒 Implements thorough input validation on both the client and server sides.
🛡️ Ensures data integrity, security, and a safe user experience.

🛠️ Setup Instructions
To get PAWA Q&A AI up and running, follow these steps:
Prerequisites
Ensure you have the following installed on your system:
Python: Version 3.9 or higher
Node.js: Version 16 or higher
OpenAI API Key: Obtain your API key by signing up at OpenAI.
Backend Setup
Navigate to the backend directory:



cd backend




Create and activate a virtual environment:



python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate




Install dependencies:


pip install fastapi uvicorn pydantic openai python-dotenv tenacity




Configure environment variables:


Create a .env file in the backend directory with the following content:
OPENAI_API_KEY=your_openai_api_key_here




Run the server:



uvicorn main:app --host 0.0.0.0 --port 8000 --reload




Access the backend endpoints:


API base URL: http://localhost:8000
Swagger UI documentation: http://localhost:8000/docs
Health check endpoint: http://localhost:8000/health
Frontend Setup
Navigate to the frontend directory:



cd frontend




Install dependencies:



npm install
npm install react-markdown




Run the development server:



npm run dev




Access the application:


Open your browser and go to: http://localhost:3000

🚀 Usage
To use PAWA Q&A AI:
Open http://localhost:3000 in your web browser.
Enter a travel-related question in the input field (e.g., "What documents do I need to travel from Kenya to Ireland?").
Click the "Ask" button or press Enter to submit your query and receive a detailed response.


Example
Input:
What documents do I need to travel from Kenya to Ireland?
Output:
Markdown
## Required Documents for Travel from Kenya to Ireland

### Passport
- Valid Kenyan passport with at least 6 months validity.

### Visa
- Irish Short Stay 'C' Visa required for Kenyan nationals.
- Apply through the Irish Embassy or online portal.

### Additional Documents
- Proof of accommodation.
- Travel insurance.
- Flight itinerary.



🐛 Troubleshooting
Here are solutions to common issues you might encounter:
Backend not responding:


Ensure the server is running (uvicorn main:app --host 0.0.0.0 --port 8000 --reload).
Verify that the OpenAI API key is correctly set in the .env file.
CORS errors:


Check that the frontend URL (e.g., http://localhost:3000) matches the allowed origins configured in the main.py file.
Empty responses:


Confirm the OpenAI API key is valid and correctly entered in the .env file.
Ensure a stable internet connection to communicate with the OpenAI API.

☁️ Deployment Notes
For production deployment, consider the following:
Backend:


Replace the development server with a production-ready WSGI server like Gunicorn combined with Uvicorn for improved performance and scalability (e.g., gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app).
Frontend:


Build the application using npm run build and deploy it to a platform like Vercel or a static file server (e.g., Nginx or Netlify).

🌟 Enhancements
Significant improvements have been made to the original system for a better user experience and increased robustness:
Error Handling:


Added retry mechanisms for failed API calls to improve reliability.
Implemented timeouts for long-running requests to prevent bottlenecks.
Incorporated detailed logging for easier debugging and issue identification.
Validation:


Introduced checks for input repetition to avoid redundant queries.
Integrated profanity filtering to maintain appropriate content.
Enforced length constraints for inputs to ensure quality and prevent abuse.
UI/UX:


Enhanced the frontend with a character counter for user guidance.
Added a loading spinner during API calls to provide real-time feedback.
Implemented accessibility improvements for broader usability and inclusivity.


