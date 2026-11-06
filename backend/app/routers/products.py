from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/products", tags=["Product comparison"])

DEMO_OFFERS = [
    {
        "id": 1,
        "product": "Sony WH-1000XM5 Wireless Headphones",
        "retailer": "Demo Store A",
        "price": 24990,
        "shipping": 0,
        "url": "https://example.com/store-a",
        "currency": "INR"
    },
    {
        "id": 2,
        "product": "Sony WH-1000XM5 Wireless Headphones",
        "retailer": "Demo Store B",
        "price": 23999,
        "shipping": 99,
        "url": "https://example.com/store-b",
        "currency": "INR"
    },
    {
        "id": 3,
        "product": "Sony WH-1000XM5 Wireless Headphones",
        "retailer": "Demo Store C",
        "price": 25500,
        "shipping": 0,
        "url": "https://example.com/store-c",
        "currency": "INR"
    },
    {
        "id": 4,
        "product": "Apple AirPods Pro 2",
        "retailer": "Demo Store A",
        "price": 18900,
        "shipping": 0,
        "url": "https://example.com/airpods-a",
        "currency": "INR"
    },
    {
        "id": 5,
        "product": "Apple AirPods Pro 2",
        "retailer": "Demo Store B",
        "price": 19499,
        "shipping": 49,
        "url": "https://example.com/airpods-b",
        "currency": "INR"
    }
]


@router.get("/search")
def search_products(q: str = Query(min_length=2, max_length=100)):
    query = q.strip().lower()
    matches = [
        offer for offer in DEMO_OFFERS
        if query in offer["product"].lower()
        or all(word in offer["product"].lower() for word in query.split())
    ]
    matches.sort(key=lambda item: item["price"] + item["shipping"])
    return {
        "query": q,
        "mode": "demo-catalogue",
        "count": len(matches),
        "offers": matches,
        "best_offer": matches[0] if matches else None,
        "notice": "Demonstration prices and retailers only; not live retailer data."
    }
