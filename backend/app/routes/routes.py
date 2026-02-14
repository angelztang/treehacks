from flask import Blueprint, render_template, send_from_directory, current_app
from ..cas.auth import login_required
from ..utils.assets import get_asset_path
from .auth_routes import bp as auth_bp

# Create the main blueprint
main = Blueprint('main', __name__)

# Register the auth blueprint
main.register_blueprint(auth_bp)

# Route handler for the main landing page
@main.route('/')
def landing():
    asset_path = get_asset_path("landing")
    return render_template(
        "index.html", app_name="landing", debug=current_app.debug, asset_path=asset_path
    )

# Route handler for the protected page
@main.route('/protected')
@login_required
def protected():
    asset_path = get_asset_path("protected")
    return render_template(
        "index.html", app_name="protected", debug=current_app.debug, asset_path=asset_path
    )

# Catch all for static assets
@main.route('/<path:path>')
def static_proxy(path):
    """
    Serve static files from the build directory
    """
    return send_from_directory("build", path) 