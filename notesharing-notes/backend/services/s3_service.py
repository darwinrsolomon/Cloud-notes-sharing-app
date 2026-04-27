import boto3
import mimetypes
from utils.config import settings

s3 = boto3.client("s3", region_name=settings.aws_region)
BUCKET = settings.aws_s3_bucket

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def upload_file(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
        ServerSideEncryption="AES256",
    )
    return f"https://{BUCKET}.s3.{settings.aws_region}.amazonaws.com/{key}"

def generate_presigned_download_url(key: str, expires_in: int = 3600) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )

def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 900) -> str:
    return s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )

def delete_file(key: str) -> bool:
    s3.delete_object(Bucket=BUCKET, Key=key)
    return True

def get_content_type(filename: str) -> str:
    ct, _ = mimetypes.guess_type(filename)
    return ct or "application/octet-stream"
