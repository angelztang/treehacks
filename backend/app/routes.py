@bp.route('/listings', methods=['GET'])
def get_listings():
    search_query = request.args.get('search', '')
    max_price = request.args.get('max_price', type=float)
    category = request.args.get('category')
    status = request.args.get('status', 'available')

    query = Listing.query

    # Apply search filter if search query is provided
    if search_query:
        query = query.filter(
            db.or_(
                Listing.title.ilike(f'%{search_query}%'),
                Listing.description.ilike(f'%{search_query}%')
            )
        )

    # Apply other filters
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    if category:
        query = query.filter(Listing.category == category)
    if status:
        query = query.filter(Listing.status == status)

    listings = query.all()
    return jsonify([{
        'id': listing.id,
        'title': listing.title,
        'description': listing.description,
        'price': listing.price,
        'status': listing.status,
        'seller_id': listing.seller_id,
        'buyer_id': listing.buyer_id,
        'created_at': listing.created_at.isoformat(),
        'updated_at': listing.updated_at.isoformat(),
        'images': listing.images,
        'condition': listing.condition
    } for listing in listings])

@bp.route('/listings', methods=['POST'])
@jwt_required()
def create_listing():
    data = request.get_json()
    listing = Listing(
        title=data['title'],
        description=data['description'],
        price=data['price'],
        seller_id=get_jwt_identity(),
        images=data.get('images', []),
        condition=data.get('condition', 'good')
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({
        'id': listing.id,
        'title': listing.title,
        'description': listing.description,
        'price': listing.price,
        'status': listing.status,
        'seller_id': listing.seller_id,
        'buyer_id': listing.buyer_id,
        'created_at': listing.created_at.isoformat(),
        'updated_at': listing.updated_at.isoformat(),
        'images': listing.images,
        'condition': listing.condition
    }), 201 