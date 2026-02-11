from typing import List, Optional, Dict, Any
from anthropic import Anthropic
from sqlmodel import Session
import os
import re
import json
from datetime import datetime
from ..models.task import Task
from ..services.task_service import TaskService


class AIService:
    """
    AI service for task assistance using Anthropic Claude.
    Handles query processing, task context building, and AI interactions.
    """

    def __init__(self):
        """Initialize AI service with Anthropic client."""
        self.provider = os.getenv("AI_PROVIDER", "anthropic")
        self.api_key = os.getenv("AI_API_KEY")
        self.model = os.getenv("AI_MODEL", "claude-3-sonnet-20240229")
        self.max_tokens = int(os.getenv("AI_MAX_TOKENS", "1000"))
        self.timeout = int(os.getenv("AI_TIMEOUT_SECONDS", "30"))

        if not self.api_key:
            raise ValueError("AI_API_KEY environment variable is required")

        # Initialize Anthropic client
        if self.provider == "anthropic":
            self.client = Anthropic(api_key=self.api_key)
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}")

    def validate_query(self, query_text: str) -> str:
        """
        Validate and sanitize user query.

        Args:
            query_text: Raw query text from user

        Returns:
            Sanitized query text

        Raises:
            ValueError: If query is invalid
        """
        # Strip whitespace
        query = query_text.strip()

        # Check length
        if len(query) == 0:
            raise ValueError("Query cannot be empty")
        if len(query) > 1000:
            raise ValueError("Query too long (maximum 1000 characters)")

        # Basic sanitization - remove potentially harmful characters
        # Allow alphanumeric, spaces, and common punctuation
        sanitized = re.sub(r'[^\w\s\?\!\.\,\-\:\;\(\)]', '', query)

        return sanitized

    def format_task_context_for_prompt(self, task_context: Dict[str, Any]) -> str:
        """
        Format task context into a text prompt for AI.

        Args:
            task_context: Task context from build_task_context

        Returns:
            Formatted text for AI prompt
        """
        tasks = task_context["tasks"]
        stats = {
            "total": task_context["total_tasks"],
            "completed": task_context["completed_tasks"],
            "pending": task_context["pending_tasks"],
            "high_priority": task_context["high_priority_count"],
            "overdue": task_context["overdue_count"]
        }

        # Build context text
        context_parts = [
            f"User has {stats['total']} total tasks:",
            f"- {stats['completed']} completed",
            f"- {stats['pending']} pending",
            f"- {stats['high_priority']} high priority",
            f"- {stats['overdue']} overdue",
            "",
            "Task List:"
        ]

        # Add each task
        for task in tasks:
            task_line = f"- [{task['priority'].upper()}] {task['title']}"
            if task['is_completed']:
                task_line += " (COMPLETED)"
            if task['due_date']:
                task_line += f" | Due: {task['due_date']}"
            if task['description']:
                task_line += f" | {task['description']}"
            context_parts.append(task_line)

        return "\n".join(context_parts)

    def build_task_context(self, session: Session, user_id: int) -> Dict[str, Any]:
        """
        Build task context for AI from user's tasks.

        Args:
            session: Database session
            user_id: ID of the user

        Returns:
            Dictionary containing task context information
        """
        # Fetch all user tasks
        tasks = TaskService.get_tasks_by_user(session, user_id)

        # Calculate statistics
        now = datetime.utcnow()
        completed = [t for t in tasks if t.is_completed]
        pending = [t for t in tasks if not t.is_completed]
        high_priority = [t for t in tasks if t.priority == "high"]
        overdue = [t for t in pending if t.due_date and t.due_date < now]

        # Build context
        context = {
            "user_id": user_id,
            "total_tasks": len(tasks),
            "completed_tasks": len(completed),
            "pending_tasks": len(pending),
            "high_priority_count": len(high_priority),
            "overdue_count": len(overdue),
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "priority": t.priority,
                    "is_completed": t.is_completed,
                    "due_date": t.due_date.isoformat() if t.due_date else None,
                    "created_at": t.created_at.isoformat(),
                    "completed_at": t.completed_at.isoformat() if t.completed_at else None
                }
                for t in tasks
            ]
        }

        return context

    def detect_breakdown_request(self, query_text: str) -> bool:
        """
        Detect if user is requesting a task breakdown.

        Args:
            query_text: User's query

        Returns:
            True if query is asking for task breakdown
        """
        breakdown_keywords = [
            "break down",
            "breakdown",
            "break up",
            "split",
            "divide",
            "subtask",
            "sub-task",
            "sub task",
            "how should i",
            "how can i break",
            "steps to",
            "break into"
        ]

        query_lower = query_text.lower()
        return any(keyword in query_lower for keyword in breakdown_keywords)

    async def generate_task_breakdown(
        self,
        query_text: str,
        task_context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate structured task breakdown suggestions.

        Args:
            query_text: User's breakdown request
            task_context: Task context from build_task_context

        Returns:
            List of suggested subtasks with title, description, rationale
        """
        try:
            # Format task context
            context_text = self.format_task_context_for_prompt(task_context)

            # Build system prompt for breakdown
            system_prompt = """You are a task breakdown specialist.
Your role is to help users break down complex tasks into manageable subtasks.

IMPORTANT RULES:
1. Suggest 3-5 specific, actionable subtasks
2. Each subtask should be clear and achievable
3. Provide a brief rationale for each subtask
4. Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "type": "task_breakdown",
      "title": "Subtask title",
      "description": "What needs to be done",
      "rationale": "Why this subtask is important"
    }
  ]
}

Do not include any text before or after the JSON."""

            # Build user prompt
            user_prompt = f"""Task Context:
{context_text}

User Request: {query_text}

Please suggest 3-5 subtasks to break down this work. Return ONLY the JSON format specified."""

            # Call Anthropic API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ],
                timeout=self.timeout
            )

            # Extract and parse response
            response_text = message.content[0].text.strip()

            # Try to extract JSON if wrapped in markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            # Parse JSON
            parsed = json.loads(response_text)
            suggestions = parsed.get("suggestions", [])

            # Validate and limit to 10 tasks (as per T033)
            if len(suggestions) > 10:
                suggestions = suggestions[:10]

            return suggestions

        except json.JSONDecodeError as e:
            print(f"Failed to parse AI breakdown response: {str(e)}")
            return []
        except Exception as e:
            print(f"Task breakdown generation error: {str(e)}")
            return []

    def detect_priority_request(self, query_text: str) -> bool:
        """
        Detect if user is requesting priority explanation or focus advice.

        Args:
            query_text: User's query

        Returns:
            True if query is asking about priorities or what to focus on
        """
        priority_keywords = [
            "priority",
            "priorities",
            "focus",
            "should i work on",
            "what should i do",
            "most important",
            "urgent",
            "critical",
            "what next",
            "what's next",
            "where to start",
            "start with"
        ]

        query_lower = query_text.lower()
        return any(keyword in query_lower for keyword in priority_keywords)

    async def generate_priority_explanation(
        self,
        query_text: str,
        task_context: Dict[str, Any]
    ) -> str:
        """
        Generate priority explanation with reasoning and tradeoffs.

        Args:
            query_text: User's priority question
            task_context: Task context with priority analysis

        Returns:
            Explanation text with reasoning about priorities
        """
        try:
            # Format task context with priority emphasis
            context_text = self.format_task_context_for_prompt(task_context)

            # Build system prompt for priority explanation
            system_prompt = """You are a task priority advisor.
Your role is to help users understand their task priorities and make informed decisions.

IMPORTANT RULES:
1. Explain priorities with clear reasoning and tradeoffs
2. Present options and considerations - do NOT dictate what the user must do
3. Use simple, non-technical language
4. Consider urgency (due dates), importance (priority level), and workload
5. Acknowledge that the user knows their context best
6. Be advisory, not prescriptive - use phrases like "you might consider", "one approach could be"
7. Explain the reasoning behind different priority approaches

Avoid:
- Technical jargon
- Absolute statements like "you must" or "you should definitely"
- Making decisions for the user"""

            # Build user prompt with priority context
            stats = task_context
            priority_context = f"""
Priority Analysis:
- High priority tasks: {stats['high_priority_count']}
- Overdue tasks: {stats['overdue_count']}
- Pending tasks: {stats['pending_tasks']}
- Completed tasks: {stats['completed_tasks']}

{context_text}

User Question: {query_text}

Please explain the priority considerations and tradeoffs to help the user decide what to focus on."""

            # Call Anthropic API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": priority_context}
                ],
                timeout=self.timeout
            )

            # Extract response
            response_text = message.content[0].text

            return response_text

        except Exception as e:
            print(f"Priority explanation generation error: {str(e)}")
            raise

    async def query_ai(
        self,
        query_text: str,
        task_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Query AI with user's question and task context.

        Args:
            query_text: User's natural language query (already validated)
            task_context: Task context from build_task_context

        Returns:
            Dictionary with response text, token count, and metadata

        Raises:
            Exception: If AI service fails
        """
        try:
            # Format task context for prompt
            context_text = self.format_task_context_for_prompt(task_context)

            # Build system prompt
            system_prompt = """You are a helpful task management assistant.
Your role is to help users understand and manage their tasks.

IMPORTANT RULES:
1. Only reference tasks that are provided in the context
2. Never invent or hallucinate tasks that don't exist
3. Provide clear, simple explanations without technical jargon
4. If asked about tasks that don't exist, politely say you don't see them
5. Be concise but helpful

When suggesting task breakdowns, provide 3-5 specific, actionable subtasks."""

            # Build user prompt
            user_prompt = f"""Task Context:
{context_text}

User Question: {query_text}

Please answer based ONLY on the tasks shown above. Do not invent tasks."""

            # Call Anthropic API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ],
                timeout=self.timeout
            )

            # Extract response
            response_text = message.content[0].text
            token_count = message.usage.input_tokens + message.usage.output_tokens

            return {
                "response": response_text,
                "token_count": token_count,
                "model": self.model
            }

        except Exception as e:
            # Log error and re-raise
            print(f"AI service error: {str(e)}")
            raise Exception(f"AI service unavailable: {str(e)}")

    async def query(self, query_text: str, task_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query AI with user's question and task context.
        This is the main entry point that includes validation and error handling.

        Args:
            query_text: User's natural language query
            task_context: Task context from build_task_context

        Returns:
            Dictionary with response text, suggestions, and metadata

        Raises:
            ValueError: If query is invalid
            Exception: If AI service fails
        """
        # Validate query
        validated_query = self.validate_query(query_text)

        # Check if this is a breakdown request
        is_breakdown = self.detect_breakdown_request(validated_query)

        # Check if this is a priority request
        is_priority = self.detect_priority_request(validated_query)

        if is_breakdown:
            # Generate task breakdown suggestions
            suggestions = await self.generate_task_breakdown(validated_query, task_context)

            # Also get a conversational response
            result = await self.query_ai(validated_query, task_context)
            result["suggestions"] = suggestions
        elif is_priority:
            # Generate priority explanation with enhanced reasoning
            response_text = await self.generate_priority_explanation(validated_query, task_context)

            # Return with token count estimate (since we made the API call in generate_priority_explanation)
            result = {
                "response": response_text,
                "token_count": len(response_text.split()) * 2,  # Rough estimate
                "model": self.model,
                "suggestions": []
            }
        else:
            # Regular query
            result = await self.query_ai(validated_query, task_context)
            result["suggestions"] = []

        return result
