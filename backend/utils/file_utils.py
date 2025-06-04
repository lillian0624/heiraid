import os
import uuid

ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def save_upload_file(file_part, upload_dir='temp_uploads') -> str:
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file_part.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, 'wb') as f:
        f.write(file_part.file.read())  # file_part.file is a file-like object

    return file_path
