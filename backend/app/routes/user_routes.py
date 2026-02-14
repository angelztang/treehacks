from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User

bp = Blueprint('users', __name__)

@bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({'username': user.username, 'email': user.email})
    return jsonify({'message': 'User not found'}), 404
