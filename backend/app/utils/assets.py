import os
from flask import current_app

def get_asset_path(app_name):
    """Get the path to the asset directory for a given app.
    
    Args:
        app_name (str): Name of the app (e.g., 'landing', 'protected')
        
    Returns:
        str: Path to the asset directory
    """
    # Get the path to the static directory
    static_dir = os.path.join(current_app.root_path, 'static')
    
    # Create app-specific asset directory if it doesn't exist
    asset_dir = os.path.join(static_dir, app_name)
    if not os.path.exists(asset_dir):
        os.makedirs(asset_dir)
        
    return f'/static/{app_name}' 