import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in .env")
        _client = genai.Client(api_key=api_key)
    return _client


def generate_cold_email(company: str, title: str, job_description: str | None) -> str:
    client = get_client()

    description_context = (
        f"\n\nHere is the job description for context:\n{job_description}"
        if job_description
        else ""
    )

    prompt = f"""You are helping a job seeker write a short, personalized cold outreach email to a recruiter or hiring manager.

Job details:
- Company: {company}
- Role: {title}{description_context}

Write a concise, professional cold email (under 150 words) that:
- Has a clear, specific subject line
- Briefly introduces the sender's interest in this specific role
- Highlights genuine enthusiasm without being generic or sounding like a form letter
- Ends with a clear, low-pressure call to action (e.g. asking for a brief chat)
- Does NOT include placeholder brackets like [Your Name] — instead use "[Your Name]" only where truly unavoidable, and keep those to a minimum

Return ONLY the email (subject line + body), no extra commentary."""

    response = client.models.generate_content(
       model="gemini-3.6-flash",
        contents=prompt,
    )
    return response.text


def generate_prep_notes(company: str, title: str, job_description: str | None) -> str:
    client = get_client()

    description_context = (
        f"\n\nHere is the job description for context:\n{job_description}"
        if job_description
        else ""
    )

    prompt = f"""You are helping a job seeker prepare for an interview.

Job details:
- Company: {company}
- Role: {title}{description_context}

Generate concise interview prep notes with these sections:
1. **Key skills/requirements to emphasize** (bullet points, based on the job description)
2. **Likely interview questions** (3-4 questions specific to this role)
3. **Smart questions to ask the interviewer** (2-3 questions)

Keep it practical and specific to this role, not generic advice. Use markdown formatting with bold section headers."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return response.text