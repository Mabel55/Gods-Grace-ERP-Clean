import os
from dotenv import load_dotenv

# LangChain Database and Agent Tools
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent, SQLDatabaseToolkit 
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.rate_limiters import InMemoryRateLimiter

# 1. Load the secret key from your .env file
load_dotenv()

# Explicitly grab the API key to prevent ValidationErrors
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# 2. Connect to your existing SQLite school database
db = SQLDatabase.from_uri("sqlite:///./school_management.db")

# 3. Create the "Speed Limit" (Throttles the agent to stay under the free tier quota)
rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.15,  
    check_every_n_seconds=0.1,
    max_bucket_size=1,
)

# 4. Initialize the Gemini LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-3-1-flash-lite-preview", 
    temperature=0,
    google_api_key=my_api_key, 
    rate_limiter=rate_limiter 
)

# 5. Build the proper Toolkit so the agent understands the database
toolkit = SQLDatabaseToolkit(db=db, llm=llm)

# 6. Create the SQL Agent Executor
agent_executor = create_sql_agent(
    llm=llm,
    toolkit=toolkit, 
    verbose=True,
    agent_type="zero-shot-react-description",
    handle_parsing_errors=True # Tells the agent to self-correct formatting errors
)

def ask_school_assistant(question: str):
    print(f"\n--- Question: {question} ---")
    try:
        response = agent_executor.invoke({"input": question})
        print(f"\nAnswer: {response['output']}\n")
        return response['output']
    except Exception as e:
        print(f"Error: {e}")

# --- Test the RAG Pipeline ---
if __name__ == "__main__":
    ask_school_assistant("What score did Uche Eze get in Mathematics?")