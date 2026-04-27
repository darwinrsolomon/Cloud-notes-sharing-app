import boto3
from boto3.dynamodb.conditions import Key, Attr
from utils.config import settings
from typing import Optional, List

dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
users_table = dynamodb.Table(settings.dynamodb_users_table)
notes_table = dynamodb.Table(settings.dynamodb_notes_table)

# ─── Users ───────────────────────────────────────────────────────────────────

def create_user(user_data: dict) -> dict:
    users_table.put_item(Item=user_data)
    return user_data

def get_user_by_id(user_id: str) -> Optional[dict]:
    resp = users_table.get_item(Key={"user_id": user_id})
    return resp.get("Item")

def get_user_by_email(email: str) -> Optional[dict]:
    resp = users_table.scan(FilterExpression=Attr("email").eq(email))
    items = resp.get("Items", [])
    return items[0] if items else None

def update_user(user_id: str, updates: dict) -> dict:
    expr = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    names = {f"#{k}": k for k in updates}
    values = {f":{k}": v for k, v in updates.items()}
    users_table.update_item(
        Key={"user_id": user_id},
        UpdateExpression=expr,
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
    )
    return get_user_by_id(user_id)

# ─── Notes ───────────────────────────────────────────────────────────────────

def create_note(note_data: dict) -> dict:
    notes_table.put_item(Item=note_data)
    return note_data

def get_note_by_id(note_id: str) -> Optional[dict]:
    resp = notes_table.get_item(Key={"note_id": note_id})
    return resp.get("Item")

def get_all_notes(limit: int = 50) -> List[dict]:
    resp = notes_table.scan(Limit=limit)
    items = resp.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

def get_notes_by_subject(subject: str) -> List[dict]:
    resp = notes_table.query(
        IndexName="subject-index",
        KeyConditionExpression=Key("subject").eq(subject),
    )
    items = resp.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

def search_notes(query: str) -> List[dict]:
    q = query.lower()
    resp = notes_table.scan(
        FilterExpression=(
            Attr("title").contains(q)
            | Attr("subject").contains(q)
            | Attr("description").contains(q)
            | Attr("tags").contains(q)
        )
    )
    items = resp.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

def update_note(note_id: str, updates: dict) -> Optional[dict]:
    if not updates:
        return get_note_by_id(note_id)
    expr = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    names = {f"#{k}": k for k in updates}
    values = {f":{k}": v for k, v in updates.items()}
    notes_table.update_item(
        Key={"note_id": note_id},
        UpdateExpression=expr,
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
    )
    return get_note_by_id(note_id)

def delete_note(note_id: str) -> bool:
    notes_table.delete_item(Key={"note_id": note_id})
    return True

def get_notes_by_uploader(uploader_id: str) -> List[dict]:
    resp = notes_table.scan(FilterExpression=Attr("uploader_id").eq(uploader_id))
    items = resp.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items
