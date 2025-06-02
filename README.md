PAWA Q&A AI
Author: George Alfred Nyamema (GitHub)Repository: PAWA Q&A AI  
PAWA Q&A AI is an advanced interactive Q&A system designed to deliver detailed and accurate responses to travel-related queries. This project integrates OpenAI's ChatGPT for natural language processing, leverages FastAPI for a robust backend, and uses Next.js with TailwindCSS for an intuitive frontend. It is optimized for reliability and user experience, featuring comprehensive error handling, input validation, and real-time feedback.
Features

Backend: Built with FastAPI, including Cross-Origin Resource Sharing (CORS) support, detailed logging for debugging, and health check endpoints for monitoring system status.  
Frontend: Developed using Next.js with React, styled with TailwindCSS, and enhanced with real-time user feedback mechanisms.  
LLM Integration: Powered by OpenAI's GPT-3.5-turbo model, with retry logic for failed requests and structured response parsing for consistency.  
Validation: Implements thorough input validation on both the client and server sides to ensure data integrity, security, and a safe user experience.

Setup Instructions
Prerequisites
To run PAWA Q&A AI, ensure you have the following installed:  

Python: Version 3.9 or higher  
Node.js: Version 16 or higher  
OpenAI API Key: Sign up at OpenAI to obtain your API key

Backend Setup
Follow these steps to set up and run the backend:  

Navigate to the backend directory:  
cd backend


Create and activate a virtual environment:  
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install dependencies:  
pip install fastapi uvicorn pydantic openai python-dotenv tenacity


Configure environment variables:  

Create a .env file in the backend directory with the following content:  OPENAI_API_KEY=your_openai_api_key_here




Run the server:  
uvicorn main:app --host 0.0.0.0 --port 8000 --reload


Access the backend endpoints:  

API base URL: http://localhost:8000  
Swagger UI documentation: http://localhost:8000/docs  
Health check endpoint: http://localhost:8000/health



Frontend Setup
Follow these steps to set up and run the frontend:  

Navigate to the frontend directory:  
cd frontend


Install dependencies:  
npm install
npm install react-markdown


Run the development server:  
npm run dev


Access the application:  

Open your browser and go to: http://localhost:3000



Usage
To use PAWA Q&A AI:  

Open http://localhost:3000 in your browser.  
Enter a travel-related question in the input field (e.g., "What documents do I need to travel from Kenya to Ireland?").  
Click the "Ask" button or press Enter to submit your query and receive a detailed response.

Example
Input:  
What documents do I need to travel from Kenya to Ireland?

Output:  
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

Troubleshooting
Here are solutions to common issues:  

Backend not responding:  

Ensure the server is running (uvicorn main:app --host 0.0.0.0 --port 8000 --reload).  
Verify that the OpenAI API key is correctly set in the .env file.


CORS errors:  

Check that the frontend URL (e.g., http://localhost:3000) matches the allowed origins configured in the main.py file.


Empty responses:  

Confirm the OpenAI API key is valid and correctly entered in the .env file.  
Ensure a stable internet connection to communicate with the OpenAI API.



Deployment Notes
For production deployment:  

Backend:  

Replace the development server with a production-ready WSGI server, such as Gunicorn combined with Uvicorn, for improved performance and scalability (e.g., gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app).


Frontend:  

Build the application using npm run build and deploy it to a platform like Vercel or a static file server (e.g., Nginx or Netlify).



Enhancements
The following improvements have been made to the original system:  

Error Handling:  

Added retry mechanisms for failed API calls, timeouts for long-running requests, and detailed logging for easier debugging.


Validation:  

Implemented checks for input repetition, profanity filtering, and length constraints to maintain response quality and appropriateness.


UI/UX:  

Enhanced the frontend with a character counter, a loading spinner during API calls, and accessibility improvements for broader usability.



