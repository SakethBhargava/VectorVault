import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

def generate_response(query: str, context: str = None, prompt: str = "Answer the following question."):
    """
    Generates a response from the LLM.
    """
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    full_prompt = f"{prompt}\n\n"
    if context:
        full_prompt += f"Based on this context:\n---\n{context}\n---\n\n"
    full_prompt += f"Answer this question: {query}"

    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error from LLM: {str(e)}"