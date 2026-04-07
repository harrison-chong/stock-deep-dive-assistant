import os
from functools import lru_cache
from jinja2 import Environment, FileSystemLoader


# Cache the template environment for the prompts directory
@lru_cache(maxsize=1)
def _get_prompts_env():
    """Get cached Jinja2 environment for prompts directory."""
    prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
    return FileSystemLoader(prompts_dir)


def render_template(template_path: str, **context) -> str:
    """
    Render a Jinja2 template with provided context.

    Args:
        template_path (str): Relative path to the template file within prompts directory.
        **context: Variables to pass to the template.

    Returns:
        str: Rendered template string.
    """
    # For prompts directory templates, use cached environment
    prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
    template_dir = os.path.dirname(template_path)

    if (
        template_path.startswith("prompts/")
        or template_dir == prompts_dir
        or not template_dir
    ):
        env = Environment(loader=_get_prompts_env())
    else:
        # Fallback for other template paths
        loader = FileSystemLoader(template_dir)
        env = Environment(loader=loader)

    template_name = os.path.basename(template_path)
    template = env.get_template(template_name)
    return template.render(**context)
