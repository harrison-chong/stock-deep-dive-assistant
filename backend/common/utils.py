import os
from jinja2 import Environment, FileSystemLoader


def render_template(template_path: str, **context) -> str:
    """
    Render a Jinja2 template with provided context.

    This function creates a new Jinja2 Environment for the template's directory on each call.
    It supports any template path and is general-purpose for rendering templates from various locations.

    Args:
        template_path (str): Full or relative path to the template file (e.g., 'prompts/recommender.jinja2').
        **context: Variables to pass to the template.

    Returns:
        str: Rendered template string.

    Raises:
        jinja2.TemplateNotFound: If the template file does not exist.
        ValueError: If template_path is invalid.
    """
    # Extract the directory containing the template
    template_dir = os.path.dirname(template_path)

    # Create a loader and environment for this directory
    loader = FileSystemLoader(template_dir)
    env = Environment(loader=loader)

    # Get the template name from the path and load it
    template_name = os.path.basename(template_path)
    template = env.get_template(template_name)

    # Render the template with the provided context and return the result
    return template.render(**context)
